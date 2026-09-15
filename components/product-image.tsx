'use client';

import Image, { type ImageProps } from 'next/image';
import { isShopifyImage, shopifyImageLoader } from '@/lib/images';

/**
 * next/image for catalogue photography, wherever the photo comes from.
 *
 * A Shopify photo is sized by Shopify's CDN, which answers the browser's own
 * Accept header with WebP and turns a 4 MB PNG into about 80 KB — see
 * `shopifyImageLoader`. Local art keeps the Next optimiser, which is the better
 * path for assets we ship ourselves. Either way the caller just renders a
 * product image and gets the right one, including for products added later.
 */
export function ProductImage({ src, alt, ...rest }: ImageProps) {
  const shopify = typeof src === 'string' && isShopifyImage(src);
  return <Image {...rest} src={src} alt={alt} {...(shopify ? { loader: shopifyImageLoader } : {})} />;
}
