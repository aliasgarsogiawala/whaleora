import type { ShopifyUserError } from './types';

export const SHOPIFY_PRODUCTS_TAG = 'shopify-products';

/**
 * Env names differ between the Vercel Marketplace Shopify integration and a
 * hand-created custom app, so accept the common aliases for each value.
 */
const pick = (...names: string[]) => {
  for (const name of names) {
    const value = process.env[name];
    if (value && value.trim()) return value.trim();
  }
  return undefined;
};

/** `https://foo.myshopify.com/` and `foo.myshopify.com` both normalise to the bare host. */
const normaliseDomain = (value: string) => value.replace(/^https?:\/\//, '').replace(/\/+$/, '');

export const shopifyDomain = () => {
  const raw = pick(
    'SHOPIFY_STORE_DOMAIN',
    'SHOPIFY_SHOP_DOMAIN',
    'SHOPIFY_STORE',
    'NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN',
  );
  return raw ? normaliseDomain(raw) : undefined;
};

export const shopifyToken = () => pick(
  'SHOPIFY_STOREFRONT_ACCESS_TOKEN',
  'SHOPIFY_STOREFRONT_API_TOKEN',
  'SHOPIFY_PUBLIC_STOREFRONT_TOKEN',
  'NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN',
);

const apiVersion = () => pick('SHOPIFY_API_VERSION') ?? '2025-07';

/**
 * Full Storefront GraphQL URL. Set this to point at a proxy or a mock store;
 * otherwise it is derived from the store domain and API version.
 */
const endpoint = () => {
  const override = pick('SHOPIFY_STOREFRONT_ENDPOINT');
  if (override) return override;
  const domain = shopifyDomain();
  return domain ? `https://${domain}/api/${apiVersion()}/graphql.json` : undefined;
};

/** True once there is somewhere to send Storefront queries and a token if one is required. */
export const isShopifyConfigured = () => Boolean(endpoint() && (shopifyToken() || pick('SHOPIFY_STOREFRONT_ENDPOINT')));

class ShopifyError extends Error {
  constructor(message: string, readonly detail?: unknown) {
    super(message);
    this.name = 'ShopifyError';
  }
}

type FetchOptions = {
  query: string;
  variables?: Record<string, unknown>;
  /** Seconds. Omit for uncached (cart) requests. */
  revalidate?: number;
  tags?: string[];
};

export async function shopifyFetch<T>({ query, variables, revalidate, tags }: FetchOptions): Promise<T> {
  const url = endpoint();
  if (!url) throw new ShopifyError('Shopify is not configured');
  const token = shopifyToken();

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'X-Shopify-Storefront-Access-Token': token } : {}),
    },
    body: JSON.stringify({ query, variables }),
    ...(revalidate === undefined
      ? { cache: 'no-store' as const }
      : { next: { revalidate, tags } }),
  });

  if (!response.ok) {
    throw new ShopifyError(`Shopify responded ${response.status}`, await response.text().catch(() => undefined));
  }

  const body = (await response.json()) as { data?: T; errors?: { message: string }[] };
  if (body.errors?.length) {
    throw new ShopifyError(body.errors.map((error) => error.message).join('; '), body.errors);
  }
  if (!body.data) throw new ShopifyError('Shopify returned no data');
  return body.data;
}

/** Storefront mutations report failures in `userErrors` rather than throwing. */
export function assertNoUserErrors(errors: ShopifyUserError[] | undefined, context: string) {
  if (errors?.length) throw new ShopifyError(`${context}: ${errors.map((error) => error.message).join('; ')}`);
}

/**
 * Storefront reads should never take the storefront down — a network blip or a
 * revoked token falls back to the local catalogue instead of a 500.
 */
export async function safely<T>(operation: () => Promise<T>, context: string): Promise<T | null> {
  try {
    return await operation();
  } catch (error) {
    console.error(`[shopify] ${context}`, error);
    return null;
  }
}
