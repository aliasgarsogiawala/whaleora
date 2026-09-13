import 'server-only';
import { createCipheriv, createDecipheriv, createHash, hkdfSync, randomBytes, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';
import { shopifyDomain } from './client';

const SESSION_COOKIE = 'whaleora_customer';
const FLOW_COOKIE = 'whaleora_customer_flow';
/** Readable by the browser on purpose: it carries no token, only the fact
 *  that a session exists, so the header can label itself without a fetch. */
const MARKER_COOKIE = 'whaleora_signed_in';
const SESSION_DAYS = 30;
const SCOPES = 'openid email customer-account-api:full';
/** Refresh this far before expiry so a request never races the clock. */
const REFRESH_MARGIN_MS = 60_000;

export const customerClientId = () => process.env.SHOPIFY_CUSTOMER_CLIENT_ID?.trim() || '';
const customerClientSecret = () => process.env.SHOPIFY_CUSTOMER_CLIENT_SECRET?.trim() || '';

/** Must match a callback URI registered in the Headless channel, exactly. */
export const siteOrigin = () =>
  (process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://whaleora-three.vercel.app').replace(/\/+$/, '');
export const redirectUri = () => `${siteOrigin()}/api/auth/shopify/callback`;

export const customerAuthConfigured = () => Boolean(customerClientId() && shopifyDomain());

/**
 * Endpoints come from the store's own discovery documents rather than being
 * hardcoded, so a shop id change or a Shopify move does not strand us.
 */
type Endpoints = { authorize: string; token: string; logout: string; graphql: string };

async function discover(): Promise<Endpoints> {
  const domain = shopifyDomain();
  if (!domain) throw new Error('Shopify store domain is not configured.');
  const [openid, account] = await Promise.all([
    fetch(`https://${domain}/.well-known/openid-configuration`, { next: { revalidate: 86_400 } }).then((r) => r.json()),
    fetch(`https://${domain}/.well-known/customer-account-api`, { next: { revalidate: 86_400 } }).then((r) => r.json()),
  ]);
  return {
    authorize: openid.authorization_endpoint,
    token: openid.token_endpoint,
    logout: openid.end_session_endpoint,
    graphql: account.graphql_api,
  };
}

/* ---------------------------------------------------------------- session */

type Session = { accessToken: string; refreshToken: string; expiresAt: number; idToken?: string };

/**
 * Tokens live in an encrypted cookie. A dedicated SHOPIFY_CUSTOMER_SESSION_SECRET
 * is preferred; failing that the key is derived from ADMIN_SESSION_SECRET with a
 * distinct label, so the two never share an actual key.
 */
function sessionKey() {
  const secret = process.env.SHOPIFY_CUSTOMER_SESSION_SECRET?.trim() || process.env.ADMIN_SESSION_SECRET?.trim();
  if (!secret) throw new Error('Set SHOPIFY_CUSTOMER_SESSION_SECRET to sign customer sessions.');
  return Buffer.from(hkdfSync('sha256', Buffer.from(secret), Buffer.alloc(0), Buffer.from('whaleora-customer-session'), 32));
}

function seal(session: Session) {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', sessionKey(), iv);
  const body = Buffer.concat([cipher.update(JSON.stringify(session), 'utf8'), cipher.final()]);
  return `${iv.toString('base64url')}.${cipher.getAuthTag().toString('base64url')}.${body.toString('base64url')}`;
}

function unseal(raw: string): Session | null {
  try {
    const [iv, tag, body] = raw.split('.');
    if (!iv || !tag || !body) return null;
    const decipher = createDecipheriv('aes-256-gcm', sessionKey(), Buffer.from(iv, 'base64url'));
    decipher.setAuthTag(Buffer.from(tag, 'base64url'));
    const json = Buffer.concat([decipher.update(Buffer.from(body, 'base64url')), decipher.final()]).toString('utf8');
    return JSON.parse(json) as Session;
  } catch {
    return null;
  }
}

async function writeSession(session: Session) {
  const jar = await cookies();
  const maxAge = SESSION_DAYS * 24 * 60 * 60;
  jar.set(SESSION_COOKIE, seal(session), { httpOnly: true, sameSite: 'lax', secure: true, path: '/', maxAge });
  jar.set(MARKER_COOKIE, '1', { httpOnly: false, sameSite: 'lax', secure: true, path: '/', maxAge });
}

export async function clearCustomerSession() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
  jar.delete(FLOW_COOKIE);
  jar.delete(MARKER_COOKIE);
}

/* ------------------------------------------------------------------- PKCE */

const base64url = (input: Buffer) => input.toString('base64url');
const challengeFor = (verifier: string) => base64url(createHash('sha256').update(verifier).digest());

/** Starts the flow: returns the URL to send the browser to. */
export async function beginCustomerLogin(returnTo?: string) {
  const { authorize } = await discover();
  const verifier = base64url(randomBytes(32));
  const state = base64url(randomBytes(16));

  (await cookies()).set(FLOW_COOKIE, seal({ accessToken: verifier, refreshToken: state, expiresAt: Date.now() + 600_000, idToken: returnTo }), {
    httpOnly: true, sameSite: 'lax', secure: true, path: '/', maxAge: 600,
  });

  const url = new URL(authorize);
  url.searchParams.set('client_id', customerClientId());
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('redirect_uri', redirectUri());
  url.searchParams.set('scope', SCOPES);
  url.searchParams.set('state', state);
  url.searchParams.set('code_challenge', challengeFor(verifier));
  url.searchParams.set('code_challenge_method', 'S256');
  return url.toString();
}

async function exchange(params: Record<string, string>) {
  const { token } = await discover();
  const secret = customerClientSecret();
  const form = new URLSearchParams({ client_id: customerClientId(), ...params });
  // Confidential clients add the secret; a public client relies on PKCE alone.
  if (secret) form.set('client_secret', secret);

  const response = await fetch(token, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: form,
    cache: 'no-store',
  });
  if (!response.ok) throw new Error(`Shopify token endpoint responded ${response.status}: ${(await response.text()).slice(0, 200)}`);
  return response.json() as Promise<{ access_token: string; refresh_token: string; expires_in: number; id_token?: string }>;
}

/** Finishes the flow. Returns where the customer asked to go, if anywhere. */
export async function completeCustomerLogin(code: string, state: string) {
  const jar = await cookies();
  const flow = unseal(jar.get(FLOW_COOKIE)?.value ?? '');
  if (!flow || flow.expiresAt < Date.now()) throw new Error('That sign-in link has expired. Please try again.');

  const expected = Buffer.from(flow.refreshToken);
  const provided = Buffer.from(state);
  if (expected.length !== provided.length || !timingSafeEqual(expected, provided)) throw new Error('Sign-in could not be verified.');

  const tokens = await exchange({
    grant_type: 'authorization_code',
    redirect_uri: redirectUri(),
    code,
    code_verifier: flow.accessToken,
  });

  jar.delete(FLOW_COOKIE);
  await writeSession({
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    expiresAt: Date.now() + tokens.expires_in * 1000,
    idToken: tokens.id_token,
  });
  return flow.idToken || '/account';
}

/** A usable access token, refreshed when it is close to expiring. */
async function activeSession(): Promise<Session | null> {
  const session = unseal((await cookies()).get(SESSION_COOKIE)?.value ?? '');
  if (!session) return null;
  if (session.expiresAt - REFRESH_MARGIN_MS > Date.now()) return session;
  if (!session.refreshToken) return null;
  try {
    const tokens = await exchange({ grant_type: 'refresh_token', refresh_token: session.refreshToken });
    const next: Session = {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token || session.refreshToken,
      expiresAt: Date.now() + tokens.expires_in * 1000,
      idToken: session.idToken,
    };
    await writeSession(next);
    return next;
  } catch {
    return null;
  }
}

export async function isCustomerSignedIn() {
  return Boolean(await activeSession());
}

/** Runs a Customer Account API query as the signed-in customer. */
export async function customerQuery<T>(query: string, variables?: Record<string, unknown>): Promise<T | null> {
  const session = await activeSession();
  if (!session) return null;
  const { graphql } = await discover();
  const response = await fetch(graphql, {
    method: 'POST',
    // The Customer Account API takes the raw token, with no Bearer prefix.
    headers: { 'content-type': 'application/json', authorization: session.accessToken },
    body: JSON.stringify({ query, variables }),
    cache: 'no-store',
  });
  if (!response.ok) return null;
  const body = (await response.json()) as { data?: T; errors?: { message: string }[] };
  if (body.errors?.length) {
    console.error('[shopify] customer query failed', body.errors.map((error) => error.message).join('; '));
    return null;
  }
  return body.data ?? null;
}

export async function customerLogoutUrl() {
  const session = unseal((await cookies()).get(SESSION_COOKIE)?.value ?? '');
  const { logout } = await discover();
  const url = new URL(logout);
  if (session?.idToken) url.searchParams.set('id_token_hint', session.idToken);
  url.searchParams.set('post_logout_redirect_uri', siteOrigin());
  return url.toString();
}

/** The signed-in customer's email, for attaching to the cart. */
export async function currentCustomerEmail(): Promise<string | null> {
  const data = await customerQuery<{ customer: { emailAddress: { emailAddress: string | null } | null } | null }>(
    'query { customer { emailAddress { emailAddress } } }',
  );
  return data?.customer?.emailAddress?.emailAddress ?? null;
}
