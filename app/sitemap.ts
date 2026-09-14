import type { MetadataRoute } from 'next';
import { getCatalog } from '@/lib/shopify/catalog';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = 'https://whaleora.com';
  const routes = ['', '/products', '/about', '/safety-hub', '/institutions', '/contact', '/warranty'];
  const catalog = await getCatalog();
  return [
    ...routes.map((route) => ({ url: `${base}${route}`, lastModified: new Date(), changeFrequency: route === '' ? 'weekly' as const : 'monthly' as const, priority: route === '' ? 1 : .8 })),
    ...catalog.map((product) => ({ url: `${base}/products/${product.slug}`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: .9 })),
    ...catalog.map((product) => ({ url: `${base}/products/${product.slug}/reviews`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: .6 })),
  ];
}
