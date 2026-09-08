import { createHmac, timingSafeEqual } from 'node:crypto';
import { revalidateTag } from 'next/cache';
import { SHOPIFY_PRODUCTS_TAG } from '@/lib/shopify/client';

/**
 * Shopify product webhooks land here and drop the cached catalogue, so an admin
 * edit shows up on the storefront without waiting out the revalidate window.
 *
 * Point Shopify at POST /api/shopify/webhook for products/create, products/update
 * and products/delete, and set SHOPIFY_WEBHOOK_SECRET to the signing secret.
 */
export async function POST(request: Request) {
  const secret = process.env.SHOPIFY_WEBHOOK_SECRET;
  if (!secret) return Response.json({ error: 'Webhook secret not configured' }, { status: 500 });

  const signature = request.headers.get('x-shopify-hmac-sha256');
  if (!signature) return Response.json({ error: 'Missing signature' }, { status: 401 });

  const body = await request.text();
  const expected = createHmac('sha256', secret).update(body, 'utf8').digest('base64');

  const provided = Buffer.from(signature, 'utf8');
  const computed = Buffer.from(expected, 'utf8');
  if (provided.length !== computed.length || !timingSafeEqual(provided, computed)) {
    return Response.json({ error: 'Invalid signature' }, { status: 401 });
  }

  // Next 16 requires an expiry profile; 'max' drops the entry immediately.
  revalidateTag(SHOPIFY_PRODUCTS_TAG, 'max');
  return Response.json({ revalidated: true, topic: request.headers.get('x-shopify-topic') });
}
