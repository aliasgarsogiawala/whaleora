import { v } from 'convex/values';
import { mutation } from './_generated/server';

const lineItem = v.object({
  title: v.string(),
  quantity: v.number(),
  sku: v.optional(v.string()),
});

export const normalizeEmail = (value: string) => value.trim().toLowerCase();


export const ingestShopifyOrder = mutation({
  args: {
    secret: v.string(),
    shopifyId: v.string(),
    orderNumber: v.string(),
    email: v.string(),
    financialStatus: v.string(),
    fulfillmentStatus: v.optional(v.string()),
    total: v.string(),
    currency: v.string(),
    processedAt: v.optional(v.string()),
    statusUrl: v.optional(v.string()),
    trackingUrl: v.optional(v.string()),
    trackingNumber: v.optional(v.string()),
    lineItems: v.array(lineItem),
  },
  handler: async (ctx, args) => {
    const expected = process.env.ORDERS_INGEST_SECRET;
    if (!expected || args.secret !== expected) throw new Error('Unauthorized order ingest.');
    const email = args.email.trim();
    if (!email) return { ok: false as const, reason: 'missing-email' };
    const emailNormalized = normalizeEmail(email);
    const existing = await ctx.db
      .query('orders')
      .withIndex('by_shopify_id', (q) => q.eq('shopifyId', args.shopifyId))
      .unique();
    const record = {
      shopifyId: args.shopifyId,
      orderNumber: args.orderNumber,
      email,
      emailNormalized,
      financialStatus: args.financialStatus,
      fulfillmentStatus: args.fulfillmentStatus,
      total: args.total,
      currency: args.currency,
      processedAt: args.processedAt,
      statusUrl: args.statusUrl,
      trackingUrl: args.trackingUrl,
      trackingNumber: args.trackingNumber,
      lineItems: args.lineItems,
    };
    if (existing) {
      await ctx.db.patch(existing._id, record);
      return { ok: true as const, id: existing._id };
    }
    const id = await ctx.db.insert('orders', record);
    return { ok: true as const, id };
  },
});
