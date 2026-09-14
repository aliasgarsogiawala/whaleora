import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

const DEFAULT_NAMESPACE = 'whaleora';

export const get = query({
  args: { namespace: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const found = await ctx.db
      .query('content')
      .withIndex('by_namespace', (q) => q.eq('namespace', args.namespace ?? DEFAULT_NAMESPACE))
      .unique();
    return found ? { revision: found.revision, document: found.document } : null;
  },
});

export const save = mutation({
  args: {
    namespace: v.optional(v.string()),
    expectedRevision: v.number(),
    document: v.string(),
    secret: v.string(),
  },
  handler: async (ctx, args) => {
    // Same shared-secret guard as the order ingest: this mutation is reachable
    // by anyone holding the deployment URL, so it cannot be left open.
    const expected = process.env.ORDERS_INGEST_SECRET;
    if (!expected || args.secret !== expected) throw new Error('Unauthorized content write.');

    const namespace = args.namespace ?? DEFAULT_NAMESPACE;
    const found = await ctx.db
      .query('content')
      .withIndex('by_namespace', (q) => q.eq('namespace', namespace))
      .unique();
    const current = found?.revision ?? 0;
    // Mutations are transactional, so this read-compare-write *is* the whole
    // conflict check, with no compare-and-set dance of its own.
    if (current !== args.expectedRevision) return { ok: false as const, revision: current };

    const updatedAt = new Date().toISOString();
    const revision = current + 1;
    if (found) await ctx.db.patch(found._id, { revision, document: args.document, updatedAt });
    else await ctx.db.insert('content', { namespace, revision, document: args.document, updatedAt });
    return { ok: true as const, revision };
  },
});
