import type { MetadataRoute } from 'next';
import { getCachedProducts } from '@/lib/products.server';

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://winners-mode.vercel.app';

// Re-generate alongside the product cache so new products appear in the sitemap.
export const revalidate = 60;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = ['', '/shop', '/contact', '/faq', '/privacy', '/terms'].map((p) => ({
    url: `${SITE}${p}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: p === '' ? 1 : 0.7,
  }));

  let productRoutes: MetadataRoute.Sitemap = [];
  try {
    const products = await getCachedProducts();
    productRoutes = products.map((p) => ({
      url: `${SITE}/product/${p.id}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    }));
  } catch {
    // Firestore unreachable at build/revalidate → still ship the static routes.
  }

  return [...staticRoutes, ...productRoutes];
}
