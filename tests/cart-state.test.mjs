import assert from 'node:assert/strict';
import test from 'node:test';
import { addLine, dropLine, lineIdFor, setLineQuantity, unsellable, withLines } from '../lib/shopify/cart-state.ts';

const line = (over = {}) => ({
  id: null,
  productId: 'sos-alarm',
  variantId: 'gid://shopify/ProductVariant/1',
  handle: 'sos-alarm',
  title: 'Personal SOS Alarm',
  image: 'https://cdn.shopify.com/sos.png',
  quantity: 1,
  unitPrice: 1699,
  currencyCode: 'INR',
  ...over,
});

const connectedCart = (lines = []) => withLines({
  connected: true,
  id: 'gid://shopify/Cart/abc',
  checkoutUrl: 'https://example.myshopify.com/cart/c/abc',
  currencyCode: 'INR',
  subtotal: 0,
  totalQuantity: 0,
  lines: [],
}, lines);

test('an optimistic add appends the line and recomputes the totals', () => {
  const cart = connectedCart([]);
  const next = withLines(cart, addLine(cart.lines, line()));
  assert.equal(next.lines.length, 1);
  assert.equal(next.totalQuantity, 1);
  assert.equal(next.subtotal, 1699);
});

test('adding the same variant again merges into one line', () => {
  const cart = connectedCart([line({ id: 'gid://shopify/CartLine/1' })]);
  const next = withLines(cart, addLine(cart.lines, line({ quantity: 2 })));
  assert.equal(next.lines.length, 1);
  assert.equal(next.lines[0].quantity, 3);
  assert.equal(next.subtotal, 1699 * 3);
  assert.equal(next.lines[0].id, 'gid://shopify/CartLine/1', 'the confirmed line id survives the merge');
});

test('the same product in a different variant stays a separate line', () => {
  const cart = connectedCart([line()]);
  const next = withLines(cart, addLine(cart.lines, line({ variantId: 'gid://shopify/ProductVariant/2' })));
  assert.equal(next.lines.length, 2);
});

test('an optimistic change keeps the cart it belongs to', () => {
  // Regression: recomputing totals used to reset the cart to the local-bag
  // shape, dropping the Shopify id and checkout URL mid-session.
  const cart = connectedCart([]);
  const next = withLines(cart, addLine(cart.lines, line()));
  assert.equal(next.connected, true);
  assert.equal(next.id, 'gid://shopify/Cart/abc');
  assert.equal(next.checkoutUrl, cart.checkoutUrl);
});

test('a quantity below one removes the line, as Shopify does', () => {
  const cart = connectedCart([line({ quantity: 2 })]);
  assert.deepEqual(setLineQuantity(cart.lines, cart.lines[0], 0), []);
  assert.equal(setLineQuantity(cart.lines, cart.lines[0], 5)[0].quantity, 5);
  assert.deepEqual(dropLine(cart.lines, cart.lines[0]), []);
});

test('a quantity change on a just-added line finds the id Shopify gave it', () => {
  // Regression: the steppers are live while the add is still in flight, so the
  // line on screen has no id yet. Resolving it against the confirmed cart is
  // what stops that click being silently dropped.
  const optimistic = line({ id: null });
  const confirmed = connectedCart([line({ id: 'gid://shopify/CartLine/9' })]);
  assert.equal(lineIdFor(optimistic, confirmed), 'gid://shopify/CartLine/9');
});

test('a line id already in hand is used as-is, and an unknown line resolves to null', () => {
  assert.equal(lineIdFor(line({ id: 'gid://shopify/CartLine/7' }), null), 'gid://shopify/CartLine/7');
  assert.equal(lineIdFor(line(), null), null);
  assert.equal(lineIdFor(line({ productId: 'ghost' }), connectedCart([line()])), null);
});

test('a product the connected store has no record of cannot be sold', () => {
  // It would go in the bag and then vanish at checkout, because only Shopify
  // lines reach the hosted checkout.
  assert.equal(unsellable({ shopify: null }, true), true);
  assert.equal(unsellable({ shopify: null }, false), false, 'the local bag still takes it when Shopify is unreachable');
  assert.equal(unsellable({ shopify: { availableForSale: false } }, true), true);
  assert.equal(unsellable({ shopify: { availableForSale: true } }, true), false);
});
