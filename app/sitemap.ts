import type { MetadataRoute } from 'next';
import { getAllPostMeta } from '@/lib/posts';
import { getBaseUrl } from '@/lib/site';

export const dynamic = 'force-static';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getBaseUrl();

  // Static pages for zh and en
  const statics: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: 'daily' as const, priority: 1 },
    { url: `${base}/en`, changeFrequency: 'daily' as const, priority: 0.9 },
    { url: `${base}/blog`, changeFrequency: 'daily' as const, priority: 0.8 },
    { url: `${base}/en/blog`, changeFrequency: 'daily' as const, priority: 0.8 },
    { url: `${base}/about`, changeFrequency: 'monthly' as const, priority: 0.6 },
    { url: `${base}/en/about`, changeFrequency: 'monthly' as const, priority: 0.6 },
    { url: `${base}/links`, changeFrequency: 'monthly' as const, priority: 0.5 },
    { url: `${base}/en/links`, changeFrequency: 'monthly' as const, priority: 0.5 },
  ];

  // Blog posts for zh and en
  const [zhPosts, enPosts] = await Promise.all([
    getAllPostMeta('zh'),
    getAllPostMeta('en'),
  ]);

  const posts: MetadataRoute.Sitemap = [
    ...zhPosts.map((p) => ({
      url: `${base}/blog/${p.slug}`,
      lastModified: p.updatedAt || p.publishedAt || undefined,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
    ...enPosts.map((p) => ({
      url: `${base}/en/blog/${p.slug}`,
      lastModified: p.updatedAt || p.publishedAt || undefined,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
  ];

  return [...statics, ...posts];
}
