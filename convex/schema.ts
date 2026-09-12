import { defineSchema, defineTable } from 'convex/server';
import { authTables } from '@convex-dev/auth/server';
import { v } from 'convex/values';

export default defineSchema({
  ...authTables,
  orders: defineTable({
    shopifyId: v.string(),
    orderNumber: v.string(),
    email: v.string(),
    emailNormalized: v.string(),
    financialStatus: v.string(),
    fulfillmentStatus: v.optional(v.string()),
    total: v.string(),
    currency: v.string(),
    processedAt: v.optional(v.string()),
    statusUrl: v.optional(v.string()),
    trackingUrl: v.optional(v.string()),
    trackingNumber: v.optional(v.string()),
    lineItems: v.array(
      v.object({
        title: v.string(),
        quantity: v.number(),
        sku: v.optional(v.string()),
      }),
    ),
  })
    .index('by_email', ['emailNormalized'])
    .index('by_shopify_id', ['shopifyId']),
});
