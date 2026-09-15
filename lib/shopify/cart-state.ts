import type { CartState, CartStateLine } from './types';

/**
 * The cart arithmetic, kept clear of React so it can be reasoned about — and
 * tested — on its own. The drawer applies every change here first and lets
 * Shopify's answer reconcile it a moment later, so these have to agree with
 * what the Storefront API would have said.
 */

/** A line is the pairing of a product with a variant; quantity is not identity. */
export const matchesLine = (line: CartStateLine, productId: string, variantId: string | null) =>
  line.productId === productId && line.variantId === variantId;

/** Totals recomputed from lines, keeping whichever cart the lines belong to. */
export const withLines = (cart: CartState, lines: CartStateLine[]): CartState => ({
  ...cart,
  lines,
  subtotal: lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0),
  totalQuantity: lines.reduce((sum, line) => sum + line.quantity, 0),
  currencyCode: lines[0]?.currencyCode ?? cart.currencyCode,
});

/** Add `quantity` of a line, merging into the matching line when there is one. */
export const addLine = (lines: CartStateLine[], line: CartStateLine): CartStateLine[] =>
  lines.some((item) => matchesLine(item, line.productId, line.variantId))
    ? lines.map((item) => matchesLine(item, line.productId, line.variantId)
      ? { ...item, quantity: item.quantity + line.quantity }
      : item)
    : [...lines, line];

/** Set a line to an absolute quantity; below one removes it, as Shopify does. */
export const setLineQuantity = (lines: CartStateLine[], line: CartStateLine, quantity: number): CartStateLine[] =>
  quantity < 1
    ? dropLine(lines, line)
    : lines.map((item) => matchesLine(item, line.productId, line.variantId) ? { ...item, quantity } : item);

export const dropLine = (lines: CartStateLine[], line: CartStateLine): CartStateLine[] =>
  lines.filter((item) => !matchesLine(item, line.productId, line.variantId));

/**
 * The Shopify line id to send a change to. A line the shopper has only just
 * added carries none of its own yet, so fall back to the last cart Shopify
 * confirmed — by the time a queued call is sent, the add that created the line
 * has landed there. Null means Shopify has never held this line.
 */
export const lineIdFor = (line: CartStateLine, confirmed: CartState | null): string | null =>
  line.id
  ?? confirmed?.lines.find((item) => matchesLine(item, line.productId, line.variantId))?.id
  ?? null;

/**
 * Whether the shop can actually sell this right now. With a store connected, a
 * product Shopify has no record of cannot reach checkout — so it must not look
 * purchasable, or it would sit in the bag and quietly vanish at handoff. With
 * no store connected the local bag takes anything.
 */
export const unsellable = (
  product: { shopify: { availableForSale: boolean } | null },
  connected: boolean,
) => (connected && !product.shopify) || (product.shopify ? !product.shopify.availableForSale : false);
