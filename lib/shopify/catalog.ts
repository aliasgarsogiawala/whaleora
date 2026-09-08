import { handleFor, products, type Product } from '@/data/products';
import { isShopifyConfigured, safely, shopifyFetch, SHOPIFY_PRODUCTS_TAG } from './client';
import { PRODUCTS_QUERY } from './queries';
import type { ShopifyProduct } from './types';

/** How long a Storefront catalogue read is reused before Shopify is asked again. */
const CATALOG_REVALIDATE_SECONDS = 900;

export type CatalogProduct = Product & {
  currencyCode: string;
  /** Null when this product has no counterpart in the connected store. */
  shopify: {
    productId: string;
    handle: string;
    variantId: string;
    availableForSale: boolean;
    compareAtPrice: number | null;
  } | null;
};

const normalise = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, '');

async function fetchShopifyProducts(): Promise<ShopifyProduct[]> {
  if (!isShopifyConfigured()) return [];
  const data = await safely(
    () => shopifyFetch<{ products: { nodes: ShopifyProduct[] } }>({
      query: PRODUCTS_QUERY,
      variables: { first: 100 },
      revalidate: CATALOG_REVALIDATE_SECONDS,
      tags: [SHOPIFY_PRODUCTS_TAG],
    }),
    'catalogue fetch failed — serving the local catalogue',
  );
  return data?.products.nodes ?? [];
}

/** Prefer the store's own photography; fall back to the local art direction. */
const imagesFor = (remote: ShopifyProduct, local: Product | undefined) => {
  const remoteImages = remote.images.nodes.map((image) => image.url).filter(Boolean);
  if (remoteImages.length) return remoteImages;
  return local?.images ?? [];
};

const toNumber = (amount: string) => Number.parseFloat(amount);

/** Shopify owns price, stock and identity. The local record owns every piece of editorial copy. */
function merge(local: Product, remote: ShopifyProduct | undefined): CatalogProduct {
  if (!remote) return { ...local, currencyCode: local.currencyCode ?? 'INR', shopify: null };
  const variant = remote.variants.nodes[0];
  const price = variant ? toNumber(variant.price.amount) : toNumber(remote.priceRange.minVariantPrice.amount);
  const currencyCode = variant?.price.currencyCode ?? remote.priceRange.minVariantPrice.currencyCode;

  return {
    ...local,
    title: remote.title || local.title,
    price,
    currencyCode,
    images: imagesFor(remote, local),
    shopify: variant
      ? {
          productId: remote.id,
          handle: remote.handle,
          variantId: variant.id,
          availableForSale: remote.availableForSale && variant.availableForSale,
          compareAtPrice: variant.compareAtPrice ? toNumber(variant.compareAtPrice.amount) : null,
        }
      : null,
  };
}

/** A store product with no local record still gets a page, built from what Shopify knows. */
function adopt(remote: ShopifyProduct): CatalogProduct {
  const variant = remote.variants.nodes[0];
  const price = variant ? toNumber(variant.price.amount) : toNumber(remote.priceRange.minVariantPrice.amount);
  const currencyCode = variant?.price.currencyCode ?? remote.priceRange.minVariantPrice.currencyCode;
  const description = remote.description.trim();
  const summary = description.split(/\n+/)[0] || `${remote.title} from Whaleora.`;

  return {
    id: remote.handle,
    slug: remote.handle,
    shopifyHandle: remote.handle,
    title: remote.title,
    category: remote.tags.includes('Alarms') ? 'Alarms' : 'Tools',
    label: remote.tags[0] ?? 'Whaleora',
    shortDescription: summary,
    longDescription: description || summary,
    price,
    currencyCode,
    images: remote.images.nodes.map((image) => image.url),
    features: [],
    specifications: [],
    howItWorks: [],
    scenarios: [],
    included: [],
    accent: '#102844',
    highlights: [],
    compare: { job: summary, reachFor: '—', power: '—', carry: '—', caveat: '—' },
    shopify: variant
      ? {
          productId: remote.id,
          handle: remote.handle,
          variantId: variant.id,
          availableForSale: remote.availableForSale && variant.availableForSale,
          compareAtPrice: variant.compareAtPrice ? toNumber(variant.compareAtPrice.amount) : null,
        }
      : null,
  };
}

/**
 * The merged catalogue: every local product in its authored order, followed by
 * anything else the connected store sells.
 */
export async function getCatalog(): Promise<CatalogProduct[]> {
  const remote = await fetchShopifyProducts();
  if (!remote.length) return products.map((local) => merge(local, undefined));

  const byHandle = new Map(remote.map((item) => [item.handle, item]));
  const byTitle = new Map(remote.map((item) => [normalise(item.title), item]));
  const claimed = new Set<string>();

  const merged = products.map((local) => {
    const match = byHandle.get(handleFor(local)) ?? byTitle.get(normalise(local.title));
    if (match) claimed.add(match.handle);
    return merge(local, match);
  });

  const extras = remote.filter((item) => !claimed.has(item.handle)).map(adopt);
  return [...merged, ...extras];
}

export async function getCatalogProduct(slug: string): Promise<CatalogProduct | undefined> {
  const catalog = await getCatalog();
  return catalog.find((product) => product.slug === slug);
}

/** Handle → local product id, so Shopify cart lines can be shown with local copy. */
export async function handleToProductId(): Promise<Map<string, string>> {
  const catalog = await getCatalog();
  return new Map(
    catalog
      .filter((product): product is CatalogProduct & { shopify: NonNullable<CatalogProduct['shopify']> } => product.shopify !== null)
      .map((product) => [product.shopify.handle, product.id]),
  );
}
