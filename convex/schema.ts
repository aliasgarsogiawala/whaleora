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

  /**
   * Emergency contact cards built on the Safety Hub.
   *
   * `ownerKey` is the only way back to a card: the signed-in customer's
   * normalised email, or an opaque id held in an httpOnly cookie for everyone
   * else. It never reaches the browser, and neither does anything here — every
   * read goes through a server action holding the shared secret.
   *
   * The contents are medical and locational, so nothing in this table is
   * exposed by a public query, and only the fields the card prints are stored.
   */
  emergencyCards: defineTable({
    ownerKey: v.string(),
    // Present once the owner has signed in, so a card started anonymously can
    // be claimed by an account later.
    email: v.optional(v.string()),
    emailNormalized: v.optional(v.string()),
    accountName: v.optional(v.string()),
    card: v.object({
      name: v.string(),
      blood: v.string(),
      notes: v.string(),
      contactOneName: v.string(),
      contactOneRelation: v.string(),
      contactOnePhone: v.string(),
      contactTwoName: v.string(),
      contactTwoRelation: v.string(),
      contactTwoPhone: v.string(),
      address: v.string(),
    }),
    createdAt: v.string(),
    updatedAt: v.string(),
  })
    .index('by_owner', ['ownerKey'])
    .index('by_email', ['emailNormalized']),

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
