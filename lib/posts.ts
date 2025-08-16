import matter from 'gray-matter';
import readingTime from 'reading-time';
import { compileMDX } from 'next-mdx-remote/rsc';
import { cache } from 'react';
import remarkGfm from 'remark-gfm';
import remarkFrontmatter from 'remark-frontmatter';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypePrettyCode from 'rehype-pretty-code';
import { getStorage, localePrefix, postKey } from '@/lib/storage';
import { unstable_cache } from 'next/cache';

export type PostMeta = {
  title: string;
  slug: string;
  summary?: string;
  tags?: string[];
  lang: 'zh' | 'en';
  publishedAt?: string;
  updatedAt?: string;
  cover?: string;
  // numeric minutes for i18n formatting
  readingMinutes: number;
  readingTime: string;
  draft?: boolean;
};

export type CompiledPost = {
  meta: PostMeta;
  content: React.ReactNode;
};

// R2-only: local FS helpers removed

// Dev helpers: in-memory cache and timers
const __DEV__ = process.env.NODE_ENV !== 'production';
type DevCacheEntry = { hash: string; node: React.ReactNode };
const devCompileCache: Map<string, DevCacheEntry> | undefined = __DEV__ ? new Map() : undefined;

function hashString(input: string): string {
  // lightweight non-crypto hash (djb2)
  let h = 5381;
  for (let i = 0; i < input.length; i++) {
    h = (h * 33) ^ input.charCodeAt(i);
  }
  return (h >>> 0).toString(16);
}

export const listPostSlugs = cache(async function listPostSlugs(locale: 'zh' | 'en') {
  return unstable_cache(
    async () => {
      const storage = getStorage();
      const prefix = localePrefix(locale);
      const keys = await storage.list(prefix);
      return keys
        .filter((k) => k.endsWith('.mdx'))
        .map((k) => k.substring(prefix.length).replace(/\.mdx$/, ''));
    },
    ['listPostSlugs', locale],
    { revalidate: 300, tags: [`posts-${locale}`] }
  )();
});

function frontmatterToString(v: unknown): string {
  if (!v) return '';
  if (typeof v === 'string') return v.trim();
  // gray-matter/yaml may parse datetime into a JS Date; convert to Asia/Shanghai string
  if (v instanceof Date && !Number.isNaN(v.getTime())) {
    const rtf = new Intl.DateTimeFormat('zh-CN', {
      timeZone: 'Asia/Shanghai',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
    const parts = rtf.formatToParts(v);
    const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === type)?.value || '';
    const yyyy = get('year');
    const mm = get('month');
    const dd = get('day');
    const HH = get('hour');
    const MM = get('minute');
    const SS = get('second');
    return `${yyyy}-${mm}-${dd} ${HH}:${MM}:${SS}`;
  }
  return '';
}

// Meta-only loader (no MDX compilation). Suitable for lists.
export const getPostMeta = cache(async function getPostMeta(locale: 'zh' | 'en', slug: string): Promise<PostMeta | null> {
  return unstable_cache(
    async () => {
      const storage = getStorage();
      const key = postKey(locale, slug);
      const source = await storage.read(key);
      if (!source) return null;
      const { content, data } = matter(source);
      const meta: PostMeta = {
        title: (data as any).title || slug,
        slug,
        summary: (data as any).summary || '',
        tags: (data as any).tags || [],
        lang: locale,
        publishedAt: frontmatterToString((data as any).publishedAt),
        updatedAt: frontmatterToString((data as any).updatedAt),
        cover: (data as any).cover || '',
        readingMinutes: Math.max(1, Math.ceil(readingTime(content).minutes)),
        readingTime: readingTime(content).text,
        draft: (data as any).draft ?? false,
      };
      return meta;
    },
    ['getPostMeta', locale, slug],
    { revalidate: 300, tags: [`post-${locale}-${slug}`, `posts-${locale}`] }
  )();
});

export const getPost = cache(async function getPost(locale: 'zh' | 'en', slug: string): Promise<CompiledPost | null> {
  // 注意：不要用 unstable_cache 包裹返回 React 节点的函数，否则会把 React 元素序列化为普通对象
  // 导致 "Objects are not valid as a React child" 报错。
  const storage = getStorage();
  const key = postKey(locale, slug);
  // cached string reader avoids re-reading from R2; safe to cache (not React nodes)
  const readPostSource = unstable_cache(
    async (k: string) => {
      if (__DEV__) console.time(`[posts] read ${k}`);
      const s = await storage.read(k);
      if (__DEV__) console.timeEnd(`[posts] read ${k}`);
      return s;
    },
    ['readPostSource', locale, slug],
    { revalidate: 300, tags: [`post-${locale}-${slug}`, `posts-${locale}`] }
  );
  const source = await readPostSource(key);
  if (!source) return null;

  const { content, data } = matter(source);
  // dev cache by content hash
  const contentHash = __DEV__ ? hashString(content) : '';
  const devHit = __DEV__ && devCompileCache!.get(key);
  let compiledNode: React.ReactNode | null = null;
  if (devHit && devHit.hash === contentHash) {
    compiledNode = devHit.node;
  } else {
    if (__DEV__) console.time(`[posts] mdx ${key}`);
    const mdx = await compileMDX<Record<string, unknown>>({
      source: content,
      options: {
        parseFrontmatter: false,
        mdxOptions: {
          remarkPlugins: [remarkGfm, remarkFrontmatter],
          rehypePlugins: [
            rehypeSlug,
            [rehypeAutolinkHeadings, { behavior: 'wrap', properties: { className: 'anchor' } }],
            [
              rehypePrettyCode,
              {
                keepBackground: false,
                theme: {
                  light: 'github-light',
                  dark: 'github-dark',
                },
                defaultLang: 'plaintext',
              },
            ],
          ],
        },
      },
    });
    if (__DEV__) console.timeEnd(`[posts] mdx ${key}`);
    compiledNode = mdx.content;
    if (__DEV__) devCompileCache!.set(key, { hash: contentHash, node: compiledNode });
  }

  const meta: PostMeta = {
    title: (data as any).title || slug,
    slug,
    summary: (data as any).summary || '',
    tags: (data as any).tags || [],
    lang: locale,
    publishedAt: frontmatterToString((data as any).publishedAt),
    updatedAt: frontmatterToString((data as any).updatedAt),
    cover: (data as any).cover || '',
    readingMinutes: Math.max(1, Math.ceil(readingTime(content).minutes)),
    readingTime: readingTime(content).text,
    draft: (data as any).draft ?? false,
  };

  return { meta, content: compiledNode };
});

export async function getAllPostMeta(locale: 'zh' | 'en'): Promise<PostMeta[]> {
  return unstable_cache(
    async () => {
      const slugs = await listPostSlugs(locale);
      const metasRaw = await Promise.all(slugs.map((slug) => getPostMeta(locale, slug)));
      const metas = metasRaw
        .filter((m): m is PostMeta => !!m && !m.draft)
        .sort((a, b) => {
          const toMillis = (v?: string) => {
            if (!v) return 0;
            const s = v.trim();
            // ISO with timezone
            if (/Z|[+\-]\d{2}:?\d{2}$/.test(s)) {
              const t = Date.parse(s);
              return Number.isNaN(t) ? 0 : t;
            }
            // 'YYYY-MM-DD HH:mm:ss'
            const full = /(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/.exec(s);
            if (full) {
              const [, y, m, d, hh, mm, ss] = full;
              const t = Date.parse(`${y}-${m}-${d}T${hh}:${mm}:${ss}+08:00`);
              return Number.isNaN(t) ? 0 : t;
            }
            // 'YYYY-MM-DD'
            const dateOnly = /(\d{4})-(\d{2})-(\d{2})$/.exec(s);
            if (dateOnly) {
              const [, y, m, d] = dateOnly;
              const t = Date.parse(`${y}-${m}-${d}T00:00:00+08:00`);
              return Number.isNaN(t) ? 0 : t;
            }
            const t = Date.parse(s);
            return Number.isNaN(t) ? 0 : t;
          };
          const ta = toMillis(a.publishedAt);
          const tb = toMillis(b.publishedAt);
          return tb - ta;
        });
      return metas;
    },
    ['getAllPostMeta', locale],
    { revalidate: 300, tags: [`posts-${locale}`] }
  )();
}
