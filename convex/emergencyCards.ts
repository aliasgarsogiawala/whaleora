import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { normalizeEmail } from './orders';

/**
 * Storage for the Safety Hub's emergency contact card.
 *
 * Everything here is sensitive — blood group, medication, home address, and two
 * other people's phone numbers — so there is no public query in this file. Each
 * function takes the shared secret and is only ever called from a Next server
 * action, which resolves the owner from an httpOnly cookie or the signed-in
 * customer's session. Nothing lets a caller enumerate or guess its way to
 * someone else's card.
 */

/** Same shared-secret guard the order ingest and content writes use. */
function assertTrusted(secret: string) {
  const expected = process.env.ORDERS_INGEST_SECRET;
  if (!expected || secret !== expected) throw new Error('Unauthorized.');
}

const cardFields = v.object({
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
});

/**
 * The card for one owner. A signed-in owner is looked up by email first so the
 * card follows the account across devices, then by the device key — which is
 * what lets a card begun before signing in survive the sign-in.
 */
export const get = query({
  args: { secret: v.string(), ownerKey: v.string(), emailNormalized: v.optional(v.string()) },
  handler: async (ctx, args) => {
    assertTrusted(args.secret);
    const byEmail = args.emailNormalized
      ? await ctx.db.query('emergencyCards').withIndex('by_email', (q) => q.eq('emailNormalized', args.emailNormalized)).first()
      : null;
    const row = byEmail
      ?? await ctx.db.query('emergencyCards').withIndex('by_owner', (q) => q.eq('ownerKey', args.ownerKey)).first();
    return row ? { card: row.card, updatedAt: row.updatedAt } : null;
  },
});

export const save = mutation({
  args: {
    secret: v.string(),
    ownerKey: v.string(),
    email: v.optional(v.string()),
    accountName: v.optional(v.string()),
    card: cardFields,
  },
  handler: async (ctx, args) => {
    assertTrusted(args.secret);
    const now = new Date().toISOString();
    const emailNormalized = args.email ? normalizeEmail(args.email) : undefined;

    // Prefer the account's row, so signing in on a second device updates the
    // card already on the account rather than starting a rival copy.
    const existing = (emailNormalized
      ? await ctx.db.query('emergencyCards').withIndex('by_email', (q) => q.eq('emailNormalized', emailNormalized)).first()
      : null)
      ?? await ctx.db.query('emergencyCards').withIndex('by_owner', (q) => q.eq('ownerKey', args.ownerKey)).first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        card: args.card,
        updatedAt: now,
        // Signing in claims a card that was started anonymously; the owner key
        // moves to the account so the device cookie stops being the way in.
        ...(emailNormalized ? { ownerKey: args.ownerKey, email: args.email, emailNormalized, accountName: args.accountName } : {}),
      });
      return { ok: true as const };
    }

    await ctx.db.insert('emergencyCards', {
      ownerKey: args.ownerKey,
      ...(emailNormalized ? { email: args.email, emailNormalized, accountName: args.accountName } : {}),
      card: args.card,
      createdAt: now,
      updatedAt: now,
    });
    return { ok: true as const };
  },
});

/** Clearing the card on the device deletes the stored copy too, not just hides it. */
export const remove = mutation({
  args: { secret: v.string(), ownerKey: v.string(), emailNormalized: v.optional(v.string()) },
  handler: async (ctx, args) => {
    assertTrusted(args.secret);
    const rows = [
      ...(args.emailNormalized
        ? await ctx.db.query('emergencyCards').withIndex('by_email', (q) => q.eq('emailNormalized', args.emailNormalized)).collect()
        : []),
      ...await ctx.db.query('emergencyCards').withIndex('by_owner', (q) => q.eq('ownerKey', args.ownerKey)).collect(),
    ];
    const seen = new Set<string>();
    for (const row of rows) {
      if (seen.has(row._id)) continue;
      seen.add(row._id);
      await ctx.db.delete(row._id);
    }
    return { ok: true as const };
  },
});
