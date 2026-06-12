import type { MetadataRoute } from 'next';

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://winners-mode.vercel.app';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Private / transactional routes have no SEO value and shouldn't be indexed.
      disallow: ['/admin', '/account', '/cart', '/checkout', '/login', '/register', '/forgot-password'],
    },
    sitemap: `${SITE}/sitemap.xml`,
  };
}
