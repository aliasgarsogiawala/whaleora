import { createHmac, timingSafeEqual } from 'node:crypto';
import { revalidateTag } from 'next/cache';
import { SHOPIFY_PRODUCTS_TAG } from '@/lib/shopify/client';
import { convexHttp } from '@/lib/convex';
import { api } from '@/convex/_generated/api';

/**
 * Shopify webhooks land here.
 * - products/* busts the cached catalogue
 * - orders/* copies a snapshot into Convex for the signed-in account page
 *
 * Point Shopify at POST /api/shopify/webhook and set SHOPIFY_WEBHOOK_SECRET.
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

  const topic = request.headers.get('x-shopify-topic') || '';
  if (topic.startsWith('products/')) {
    revalidateTag(SHOPIFY_PRODUCTS_TAG, 'max');
  }
  if (topic.startsWith('orders/')) {
    try {
      await ingestOrder(JSON.parse(body) as Record<string, unknown>);
    } catch (error) {
      console.error('[shopify] order ingest failed', error);
      return Response.json({ error: 'Order ingest failed' }, { status: 500 });
    }
  }
  return Response.json({ ok: true, topic });
}

function text(value: unknown) {
  return typeof value === 'string' ? value : '';
}

function ingestOrder(payload: Record<string, unknown>) {
  const ingestSecret = process.env.ORDERS_INGEST_SECRET;
  const client = convexHttp();
  if (!ingestSecret || !client) return Promise.resolve();
  const fulfillments = Array.isArray(payload.fulfillments) ? payload.fulfillments : [];
  const fulfillment = fulfillments[0] as Record<string, unknown> | undefined;
  const items = Array.isArray(payload.line_items) ? payload.line_items : [];
  return client.mutation(api.orders.ingestShopifyOrder, {
    secret: ingestSecret,
    shopifyId: String(payload.id ?? payload.admin_graphql_api_id ?? ''),
    orderNumber: text(payload.name) || `#${payload.order_number ?? payload.id ?? ''}`,
    email: text(payload.email) || text(payload.contact_email),
    financialStatus: text(payload.financial_status) || 'unknown',
    fulfillmentStatus: text(payload.fulfillment_status) || undefined,
    total: text(payload.total_price) || '0',
    currency: text(payload.currency) || 'INR',
    processedAt: text(payload.processed_at) || text(payload.created_at) || undefined,
    statusUrl: text(payload.order_status_url) || undefined,
    trackingUrl: text(fulfillment?.tracking_url) || undefined,
    trackingNumber: text(fulfillment?.tracking_number) || undefined,
    lineItems: items.slice(0, 40).map((item) => {
      const row = item && typeof item === 'object' ? (item as Record<string, unknown>) : {};
      return {
        title: text(row.title) || 'Item',
        quantity: typeof row.quantity === 'number' ? row.quantity : Number(row.quantity) || 1,
        sku: text(row.sku) || undefined,
      };
    }),
  });
}
