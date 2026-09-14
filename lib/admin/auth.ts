import 'server-only';
import { createHash, createHmac, randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { cookies } from 'next/headers';
import { dataDirectory } from '@/lib/content/store';

const scrypt = promisify(scryptCallback);
const COOKIE = 'whaleora-admin';
type Credentials = { salt: string; hash: string; secret: string };
const digest = (value: string) => createHash('sha256').update(value).digest();
const equal = (a: string, b: string) => timingSafeEqual(digest(a), digest(b));

export async function credentials(): Promise<Credentials | null> {
  if ((process.env.ADMIN_PASSWORD?.length ?? 0) >= 8 && (process.env.ADMIN_SESSION_SECRET?.length ?? 0) >= 32) {
    return { salt: 'environment', hash: digest(process.env.ADMIN_PASSWORD!).toString('hex'), secret: process.env.ADMIN_SESSION_SECRET! };
  }
  if (process.env.ADMIN_PASSWORD || process.env.ADMIN_SESSION_SECRET) return null;
  if (process.env.NODE_ENV === 'production' && process.env.VERCEL) return null;
  try { return JSON.parse(await readFile(join(dataDirectory(), 'admin.json'), 'utf8')) as Credentials; }
  catch (error) { if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null; throw error; }
}

export async function setupPassword(password: string) {
  if (process.env.NODE_ENV !== 'development' || await credentials()) throw new Error('Initial setup is unavailable.');
  if (password.length < 8 || password.length > 200) throw new Error('Use a password between 8 and 200 characters.');
  const salt = randomBytes(16).toString('hex');
  const hash = (await scrypt(password, salt, 64) as Buffer).toString('hex');
  const config = { salt, hash, secret: randomBytes(48).toString('hex') };
  await mkdir(dataDirectory(), { recursive: true, mode: 0o700 });
  await writeFile(join(dataDirectory(), 'admin.json'), JSON.stringify(config), { flag: 'wx', mode: 0o600 });
}

export async function validPassword(password: string, config: Credentials) {
  if (password.length > 200) return false;
  const hash = config.salt === 'environment' ? digest(password).toString('hex') : (await scrypt(password, config.salt, 64) as Buffer).toString('hex');
  return equal(hash, config.hash);
}

export async function startSession(config: Credentials) {
  const payload = Buffer.from(JSON.stringify({ expires: Date.now() + 8 * 60 * 60 * 1000, version: digest(config.hash).toString('hex') })).toString('base64url');
  const signature = createHmac('sha256', config.secret).update(payload).digest('base64url');
  (await cookies()).set(COOKIE, `${payload}.${signature}`, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', path: '/', maxAge: 8 * 60 * 60 });
}

export async function isAdmin() {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token || token.length > 1024) return false;
  const config = await credentials();
  if (!config) return false;
  const [payload, signature, extra] = token.split('.');
  if (!payload || !signature || extra) return false;
  if (!equal(signature, createHmac('sha256', config.secret).update(payload).digest('base64url'))) return false;
  try { const data = JSON.parse(Buffer.from(payload, 'base64url').toString()); return typeof data.expires === 'number' && data.expires > Date.now() && data.version === digest(config.hash).toString('hex'); } catch { return false; }
}

export async function endSession() { (await cookies()).delete(COOKIE); }

export function checkOrigin(request: Request) {
  const expected = process.env.ADMIN_ORIGIN || new URL(request.url).origin;
  if (request.headers.get('origin') !== expected) throw new Error('Invalid request origin.');
}

const attempts = new Map<string, { count: number; expires: number }>();
export async function allowLogin(request: Request) {
  // A shared account-wide cap also prevents spoofed client IPs bypassing the limit.
  const client = digest(request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local').toString('hex');
  // Per-instance counters. Fluid Compute reuses instances, so a burst mostly
  // lands on one of them, but this is not a cluster-wide guarantee.
  for (const [key, limit] of [[client, 8], ['global', 60]] as const) {
    const now = Date.now();
    for (const [id, entry] of attempts) if (entry.expires <= now) attempts.delete(id);
    const entry = attempts.get(key) ?? { count: 0, expires: now + 900_000 };
    entry.count += 1; attempts.set(key, entry);
    if (entry.count > limit) return false;
  }
  return true;
}
