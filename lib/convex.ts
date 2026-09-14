import { ConvexHttpClient } from 'convex/browser';
import { fetchQuery } from 'convex/nextjs';
import { api } from '@/convex/_generated/api';

export const convexUrl = () => process.env.NEXT_PUBLIC_CONVEX_URL?.trim() || '';

export function convexHttp() {
  const url = convexUrl();
  if (!url) return null;
  return new ConvexHttpClient(url);
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
