import { getProduct } from '@/data/products';
import type { ReviewContent } from './types';

const normalize = (value: string) => value.trim().toLowerCase().replace(/[^a-z0-9]/g, '');

/** Match current and original product names, independent of video visibility. */
export function productReviews(content: ReviewContent, product: { slug: string; title: string }) {
  const local = getProduct(product.slug);
  const names = new Set([product.slug, product.title, local?.title || '',
    ...(product.slug === 'windowbreaker' ? ['Window Breaker'] : []),
  ].filter(Boolean).map(normalize));

  return {
    quotes: content.settings.showWritten
      ? content.testimonials.filter((item) => item.visible && names.has(normalize(item.detail)))
      : [],
    videos: content.settings.showVideos
      ? content.videos.filter((item) => item.visible && item.slug === product.slug)
      : [],
  };
}
