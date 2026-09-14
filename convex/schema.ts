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

  // The content studio's single document, kept as JSON because its shape is
  // already validated by lib/content/types.ts — duplicating it in Convex
  // validators would mean two schemas to keep in step. Namespaced so preview
  // and production can share a deployment without overwriting each other.
  content: defineTable({
    namespace: v.string(),
    revision: v.number(),
    document: v.string(),
    updatedAt: v.string(),
  }).index('by_namespace', ['namespace']),

  reviews: defineTable({
    productHandle: v.string(),
    rating: v.number(),
    name: v.string(),
    email: v.string(),
    emailNormalized: v.string(),
    body: v.string(),
    // Reviews publish on arrival. 'held' is only for the abuse/spam filter,
    // 'removed' is an admin taking one down after the fact.
    status: v.union(v.literal('published'), v.literal('held'), v.literal('removed')),
    // Why the filter held it, for the admin to judge. Absent when published.
    heldReason: v.optional(v.string()),
    // True when this email has an order in the orders table.
    verifiedBuyer: v.boolean(),
    submittedAt: v.string(),
  })
    .index('by_product_status', ['productHandle', 'status'])
    .index('by_status', ['status']),
});
