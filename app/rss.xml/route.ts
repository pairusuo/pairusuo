import { NextResponse } from 'next/server';
import { getAllPostMeta } from '@/lib/posts';
import { getBaseUrl } from '@/lib/site';

export const revalidate = 300;

function escape(str: string) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET() {
  const base = getBaseUrl();
  const [zhPosts, enPosts] = await Promise.all([
    getAllPostMeta('zh'),
    getAllPostMeta('en'),
  ]);

  const all = [...zhPosts.map((p) => ({ ...p, locale: 'zh' as const })), ...enPosts.map((p) => ({ ...p, locale: 'en' as const }))]
    .sort((a, b) => (b.publishedAt || '').localeCompare(a.publishedAt || ''))
    .slice(0, 50);

  const items = all.map((p) => {
    const loc = p.locale === 'zh' ? `${base}/blog/${p.slug}` : `${base}/en/blog/${p.slug}`;
    const pubDate = p.publishedAt ? new Date(p.publishedAt + ' GMT+0800').toUTCString() : new Date().toUTCString();
    return `\n    <item>
      <title>${escape(p.title)}</title>
      <link>${loc}</link>
      <guid>${loc}</guid>
      <pubDate>${pubDate}</pubDate>
      ${p.summary ? `<description>${escape(p.summary)}</description>` : ''}
    </item>`;
  }).join('');

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>pairusuo</title>
    <link>${base}</link>
    <description>Personal blog</description>
    ${items}\n  </channel>
</rss>`;

  return new NextResponse(rss, {
    status: 200,
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 's-maxage=300, stale-while-revalidate=300',
    },
  });
}
