import type { MetadataRoute } from 'next';
import { getBaseUrl } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  const base = getBaseUrl();
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/admin/',
          '/*/admin/',
          '/en/admin/',
          '/zh/admin/',
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
