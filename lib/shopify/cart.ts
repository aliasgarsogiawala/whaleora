import { assertNoUserErrors, shopifyFetch } from './client';
import {
  CART_CREATE_MUTATION,
  CART_LINES_ADD_MUTATION,
  CART_LINES_REMOVE_MUTATION,
  CART_LINES_UPDATE_MUTATION,
  CART_QUERY,
} from './queries';
import type { ShopifyCart, ShopifyUserError } from './types';

type CartMutationResult = { cart: ShopifyCart | null; userErrors: ShopifyUserError[] };

/** Returns null when the id is unknown to Shopify — an expired or completed cart. */
export async function fetchCart(cartId: string): Promise<ShopifyCart | null> {
  const data = await shopifyFetch<{ cart: ShopifyCart | null }>({ query: CART_QUERY, variables: { id: cartId } });
  return data.cart;
}

export async function createCart(variantId: string, quantity: number): Promise<ShopifyCart> {
  const data = await shopifyFetch<{ cartCreate: CartMutationResult }>({
    query: CART_CREATE_MUTATION,
    variables: { lines: [{ merchandiseId: variantId, quantity }] },
  });
  assertNoUserErrors(data.cartCreate.userErrors, 'cartCreate');
  if (!data.cartCreate.cart) throw new Error('cartCreate returned no cart');
  return data.cartCreate.cart;
}

export async function addLine(cartId: string, variantId: string, quantity: number): Promise<ShopifyCart> {
  const data = await shopifyFetch<{ cartLinesAdd: CartMutationResult }>({
    query: CART_LINES_ADD_MUTATION,
    variables: { cartId, lines: [{ merchandiseId: variantId, quantity }] },
  });
  assertNoUserErrors(data.cartLinesAdd.userErrors, 'cartLinesAdd');
  if (!data.cartLinesAdd.cart) throw new Error('cartLinesAdd returned no cart');
  return data.cartLinesAdd.cart;
}

export async function updateLine(cartId: string, lineId: string, quantity: number): Promise<ShopifyCart> {
  const data = await shopifyFetch<{ cartLinesUpdate: CartMutationResult }>({
    query: CART_LINES_UPDATE_MUTATION,
    variables: { cartId, lines: [{ id: lineId, quantity }] },
  });
  assertNoUserErrors(data.cartLinesUpdate.userErrors, 'cartLinesUpdate');
  if (!data.cartLinesUpdate.cart) throw new Error('cartLinesUpdate returned no cart');
  return data.cartLinesUpdate.cart;
}

export async function removeLine(cartId: string, lineId: string): Promise<ShopifyCart> {
  const data = await shopifyFetch<{ cartLinesRemove: CartMutationResult }>({
    query: CART_LINES_REMOVE_MUTATION,
    variables: { cartId, lineIds: [lineId] },
  });
  assertNoUserErrors(data.cartLinesRemove.userErrors, 'cartLinesRemove');
  if (!data.cartLinesRemove.cart) throw new Error('cartLinesRemove returned no cart');
  return data.cartLinesRemove.cart;
}
