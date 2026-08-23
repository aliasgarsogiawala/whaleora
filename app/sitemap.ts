import type { MetadataRoute } from 'next';
import { products } from '@/data/products';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://whaleora.com';
  const routes = ['', '/products', '/about', '/safety-hub', '/institutions', '/contact'];
  return [
    ...routes.map((route) => ({ url: `${base}${route}`, lastModified: new Date(), changeFrequency: route === '' ? 'weekly' as const : 'monthly' as const, priority: route === '' ? 1 : .8 })),
    ...products.map((product) => ({ url: `${base}/products/${product.slug}`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: .9 })),
  ];
}
