'use server';

import { cookies } from 'next/headers';
import { handleToProductId } from '@/lib/shopify/catalog';
import { addLine, createCart, fetchCart, removeLine, updateLine } from '@/lib/shopify/cart';
import { currentCustomerEmail } from '@/lib/shopify/customer';
import { isShopifyConfigured } from '@/lib/shopify/client';
import type { CartState, ShopifyCart } from '@/lib/shopify/types';

const CART_COOKIE = 'whaleora_cart';
const CART_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

const disconnected: CartState = {
  connected: false,
  id: null,
  checkoutUrl: null,
  currencyCode: 'INR',
  subtotal: 0,
  totalQuantity: 0,
  lines: [],
};

const emptyConnected: CartState = { ...disconnected, connected: true };

async function readCartId() {
  return (await cookies()).get(CART_COOKIE)?.value ?? null;
}

async function writeCartId(cartId: string) {
  (await cookies()).set(CART_COOKIE, cartId, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: CART_COOKIE_MAX_AGE,
  });
}

async function clearCartId() {
  (await cookies()).delete(CART_COOKIE);
}

async function toCartState(cart: ShopifyCart): Promise<CartState> {
  const handles = await handleToProductId();
  return {
    connected: true,
    id: cart.id,
    checkoutUrl: cart.checkoutUrl,
    currencyCode: cart.cost.subtotalAmount.currencyCode,
    subtotal: Number.parseFloat(cart.cost.subtotalAmount.amount),
    totalQuantity: cart.totalQuantity,
    lines: cart.lines.nodes.map((line) => ({
      id: line.id,
      productId: handles.get(line.merchandise.product.handle) ?? line.merchandise.product.handle,
      variantId: line.merchandise.id,
      handle: line.merchandise.product.handle,
      title: line.merchandise.product.title,
      image: line.merchandise.image?.url ?? null,
      quantity: line.quantity,
      unitPrice: Number.parseFloat(line.cost.amountPerQuantity.amount),
      currencyCode: line.cost.amountPerQuantity.currencyCode,
    })),
  };
}

/**
 * Every action funnels through here so a Shopify outage degrades to the local
 * bag instead of throwing inside a client event handler.
 */
async function guard(operation: () => Promise<CartState>): Promise<CartState> {
  if (!isShopifyConfigured()) return disconnected;
  try {
    return await operation();
  } catch (error) {
    console.error('[shopify] cart action failed', error);
    return disconnected;
  }
}

export async function getCartAction(): Promise<CartState> {
  return guard(async () => {
    const cartId = await readCartId();
    if (!cartId) return emptyConnected;
    const cart = await fetchCart(cartId);
    if (!cart) {
      await clearCartId();
      return emptyConnected;
    }
    return toCartState(cart);
  });
}

export async function addToCartAction(variantId: string, quantity = 1): Promise<CartState> {
  return guard(async () => {
    const cartId = await readCartId();
    // Straight to cartLinesAdd. Asking Shopify whether the cart still exists
    // first doubled the round-trips on the hottest path in the shop, and it
    // answers that question itself: a cart it no longer knows comes back null,
    // and only then is a second call worth paying for.
    if (cartId) {
      const cart = await addLine(cartId, variantId, quantity);
      if (cart) {
        await writeCartId(cart.id);
        return toCartState(cart);
      }
    }
    const cart = await createCart(variantId, quantity, await currentCustomerEmail());
    await writeCartId(cart.id);
    return toCartState(cart);
  });
}

export async function updateCartLineAction(lineId: string, quantity: number): Promise<CartState> {
  return guard(async () => {
    const cartId = await readCartId();
    if (!cartId) return emptyConnected;
    const cart = quantity < 1 ? await removeLine(cartId, lineId) : await updateLine(cartId, lineId, quantity);
    return toCartState(cart);
  });
}

export async function removeCartLineAction(lineId: string): Promise<CartState> {
  return guard(async () => {
    const cartId = await readCartId();
    if (!cartId) return emptyConnected;
    return toCartState(await removeLine(cartId, lineId));
  });
}
