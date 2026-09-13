import { ConvexHttpClient } from 'convex/browser';
import { convexAuthNextjsToken } from '@convex-dev/auth/nextjs/server';
import { fetchQuery } from 'convex/nextjs';
import { api } from '@/convex/_generated/api';

export const convexUrl = () => process.env.NEXT_PUBLIC_CONVEX_URL?.trim() || '';

export function convexHttp() {
  const url = convexUrl();
  if (!url) return null;
  return new ConvexHttpClient(url);
}

export async function currentAccountEmail() {
  const url = convexUrl();
  if (!url) return null;
  try {
    const token = await convexAuthNextjsToken();
    if (!token) return null;
    const user = await fetchQuery(api.users.current, {}, { token, url });
    return user?.email ?? null;
  } catch {
    return null;
  }
}

/** Published customer reviews for one product. Empty when Convex is unset. */
export async function approvedReviews(productHandle: string) {
  const url = convexUrl();
  if (!url) return [];
  try {
    return await fetchQuery(api.reviews.approved, { productHandle }, { url });
  } catch {
    return [];
  }
}
