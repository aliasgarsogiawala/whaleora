export type ShopifyMoney = { amount: string; currencyCode: string };

export type ShopifyImage = { url: string; altText: string | null; width: number | null; height: number | null };

export type ShopifyVariant = {
  id: string;
  title: string;
  availableForSale: boolean;
  price: ShopifyMoney;
  compareAtPrice: ShopifyMoney | null;
  selectedOptions: { name: string; value: string }[];
};

export type ShopifyProduct = {
  id: string;
  handle: string;
  title: string;
  description: string;
  availableForSale: boolean;
  tags: string[];
  featuredImage: ShopifyImage | null;
  images: { nodes: ShopifyImage[] };
  variants: { nodes: ShopifyVariant[] };
  priceRange: { minVariantPrice: ShopifyMoney };
};

export type ShopifyCartLine = {
  id: string;
  quantity: number;
  cost: { amountPerQuantity: ShopifyMoney; totalAmount: ShopifyMoney };
  merchandise: {
    id: string;
    title: string;
    availableForSale: boolean;
    price: ShopifyMoney;
    image: ShopifyImage | null;
    product: { id: string; handle: string; title: string };
  };
};

export type ShopifyCart = {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  cost: {
    subtotalAmount: ShopifyMoney;
    totalAmount: ShopifyMoney;
    totalTaxAmount: ShopifyMoney | null;
  };
  lines: { nodes: ShopifyCartLine[] };
};

export type ShopifyUserError = { field: string[] | null; message: string };

/** Normalised cart the client renders, in either Shopify or local-fallback mode. */
export type CartState = {
  /** False when Shopify credentials are absent — the UI falls back to a local bag. */
  connected: boolean;
  id: string | null;
  checkoutUrl: string | null;
  currencyCode: string;
  subtotal: number;
  totalQuantity: number;
  lines: CartStateLine[];
};

export type CartStateLine = {
  /** Shopify cart line id. Null in local-fallback mode. */
  id: string | null;
  /** Local catalogue product id, resolved from the Shopify handle where possible. */
  productId: string;
  variantId: string | null;
  handle: string | null;
  title: string;
  quantity: number;
  unitPrice: number;
  currencyCode: string;
};
