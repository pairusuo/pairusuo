import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import readingTime from 'reading-time';
import { compileMDX } from 'next-mdx-remote/rsc';
import { cache } from 'react';
import remarkGfm from 'remark-gfm';
import remarkFrontmatter from 'remark-frontmatter';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypePrettyCode from 'rehype-pretty-code';

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

const CONTENT_DIR = path.join(process.cwd(), 'content', 'posts');

export function getPostFilePath(locale: 'zh' | 'en', slug: string) {
  const p1 = path.join(CONTENT_DIR, locale, `${slug}.mdx`);
  return p1;
}

export const listPostSlugs = cache(function listPostSlugs(locale: 'zh' | 'en') {
  const baseDir = path.join(CONTENT_DIR, locale);
  if (!fs.existsSync(baseDir)) {
    return [] as string[];
  }

  const slugs: string[] = [];
  const walk = (dir: string) => {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      const rel = path.relative(baseDir, full);
      if (entry.isDirectory()) {
        walk(full);
      } else if (entry.isFile() && entry.name.endsWith('.mdx')) {
        const s = rel.replace(/\.mdx$/, '').split(path.sep).join('/');
        slugs.push(s);
      }
    }
  };
  walk(baseDir);
  return slugs;
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
export const getPostMeta = cache(function getPostMeta(locale: 'zh' | 'en', slug: string): PostMeta | null {
  const filePath = getPostFilePath(locale, slug);
  if (!fs.existsSync(filePath)) return null;
  const source = fs.readFileSync(filePath, 'utf8');
  const { content, data } = matter(source);
  const meta: PostMeta = {
    title: data.title || slug,
    slug,
    summary: data.summary || '',
    tags: data.tags || [],
    lang: locale,
    publishedAt: frontmatterToString(data.publishedAt),
    updatedAt: frontmatterToString(data.updatedAt),
    cover: data.cover || '',
    readingMinutes: Math.max(1, Math.ceil(readingTime(content).minutes)),
    readingTime: readingTime(content).text,
    draft: data.draft ?? false,
  };
  return meta;
});

export const getPost = cache(async function getPost(locale: 'zh' | 'en', slug: string): Promise<CompiledPost | null> {
  const filePath = getPostFilePath(locale, slug);
  if (!fs.existsSync(filePath)) return null;
  const source = fs.readFileSync(filePath, 'utf8');

  const { content, data } = matter(source);
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

  const meta: PostMeta = {
    title: data.title || slug,
    slug,
    summary: data.summary || '',
    tags: data.tags || [],
    lang: locale,
    publishedAt: frontmatterToString(data.publishedAt),
    updatedAt: frontmatterToString(data.updatedAt),
    cover: data.cover || '',
    readingMinutes: Math.max(1, Math.ceil(readingTime(content).minutes)),
    readingTime: readingTime(content).text,
    draft: data.draft ?? false,
  };

  return { meta, content: mdx.content };
});

export function getAllPostMeta(locale: 'zh' | 'en'): PostMeta[] {
  const slugs = listPostSlugs(locale);
  const metas = slugs
    .map((slug) => getPostMeta(locale, slug))
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
        const full = /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/.exec(s);
        if (full) {
          const [, y, m, d, hh, mm, ss] = full;
          const t = Date.parse(`${y}-${m}-${d}T${hh}:${mm}:${ss}+08:00`);
          return Number.isNaN(t) ? 0 : t;
        }
        // 'YYYY-MM-DD'
        const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
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
}
