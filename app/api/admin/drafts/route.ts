export const runtime = "nodejs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import matter from "gray-matter";
import { getStorage, localePrefix, postKey } from "@/lib/storage";
import { revalidateTag } from "next/cache";

function badRequest(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function DELETE(req: NextRequest) {
  const auth = ensureAuth(req);
  if (!auth.ok) return auth.res;
  const { searchParams } = new URL(req.url);
  const locale = (searchParams.get('locale') || 'zh').toLowerCase();
  if (!isLocale(locale)) return badRequest("Invalid locale; expected 'zh' or 'en'");
  const slug = (searchParams.get('slug') || '').trim();
  if (!slug) return badRequest('Missing slug');

  const storage = getStorage();
  const key = postKey(locale, slug);
  try {
    const source = await storage.read(key);
    if (!source) return badRequest('Draft not found', 404);
    const parsed = matter(source);
    const fm = parsed.data || {};
    const isDraft = (() => {
      const v = fm.draft as unknown;
      if (typeof v === 'boolean') return v;
      if (typeof v === 'number') return v === 1;
      if (typeof v === 'string') return ['true','yes','1'].includes(v.trim().toLowerCase());
      return false;
    })();
    if (!isDraft) return badRequest('Not a draft', 400);
    await storage.delete(key);
    return NextResponse.json({ ok: true, path: key, slug });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return badRequest(`Failed to delete draft: ${msg}`, 500);
  }
}

export async function PUT(req: NextRequest) {
  const auth = ensureAuth(req);
  if (!auth.ok) return auth.res;
  let body: { locale?: string; slug?: string; title?: string; summary?: string; content?: string };
  try {
    body = await req.json();
  } catch {
    return badRequest('Invalid JSON body');
  }
  const locale = (body.locale || 'zh').toLowerCase();
  if (!isLocale(locale)) return badRequest("Invalid locale; expected 'zh' or 'en'");
  if (!body.slug) return badRequest('Missing slug');
  const storage = getStorage();
  const key = postKey(locale, body.slug);
  try {
    const source = await storage.read(key);
    if (!source) return badRequest('Not a draft', 404);
    const parsed = matter(source);
    const fm = parsed.data || {};
    const isDraft = (() => {
      const v = fm.draft as unknown;
      if (typeof v === 'boolean') return v;
      if (typeof v === 'number') return v === 1;
      if (typeof v === 'string') return ['true','yes','1'].includes(v.trim().toLowerCase());
      return false;
    })();
    if (!isDraft) return badRequest('Not a draft');

    const dateTime = shanghaiDateTime();
    const newData = {
      ...fm,
      title: (body.title ?? fm.title) || body.slug,
      summary: body.summary ?? (fm.summary || ''),
      draft: true,
      updatedAt: dateTime,
      publishedAt: fm.publishedAt || dateTime,
    };
    const newContent = body.content ?? parsed.content;
    const nextFile = matter.stringify(newContent, newData);
    await storage.write(key, nextFile);
    return NextResponse.json({ ok: true, path: key, slug: body.slug });
  } catch (e: unknown) {
    return badRequest(`Failed to update draft: ${e instanceof Error ? e.message : String(e)}`, 500);
  }
}

function ensureAuth(req: NextRequest) {
  const adminToken = process.env.ADMIN_TOKEN;
  const token = req.headers.get("x-admin-token");
  if (!adminToken) return { ok: false, res: badRequest("Server not configured: ADMIN_TOKEN is missing", 500) } as const;
  if (!token || token !== adminToken) return { ok: false, res: badRequest("Unauthorized", 401) } as const;
  return { ok: true } as const;
}

function isLocale(v: string): v is "zh" | "en" {
  return v === "zh" || v === "en";
}

async function listDrafts(locale: "zh" | "en") {
  const storage = getStorage();
  const prefix = localePrefix(locale);
  const results: Array<{ title: string; slug: string; path: string; publishedAt?: string; updatedAt?: string }> = [];
  const keys = await storage.list(prefix);
  for (const key of keys) {
    if (!key.endsWith('.mdx')) continue;
    // key: posts/zh/2025/08/slug.mdx -> slug: 2025/08/slug
    const rel = key.substring(prefix.length);
    const slug = rel.replace(/\.mdx$/, '');
    const source = await storage.read(key);
    if (!source) continue;
    const { data } = matter(source);
    const draftFlag = (() => {
      const v = data?.draft as unknown;
      if (typeof v === 'boolean') return v;
      if (typeof v === 'number') return v === 1;
      if (typeof v === 'string') {
        const s = v.trim().toLowerCase();
        return s === 'true' || s === 'yes' || s === '1';
      }
      return false;
    })();
    if (draftFlag) {
      results.push({
        title: (data as any).title || slug,
        slug,
        path: key,
        publishedAt: (data as any).publishedAt || '',
        updatedAt: (data as any).updatedAt || '',
      });
    }
  }
  // Sort by last updated time desc (updatedAt fallback to publishedAt)
  results.sort((a, b) => {
    const toMillis = (v: unknown) => {
      if (!v) return 0;
      if (v instanceof Date) return v.getTime();
      if (typeof v === 'number') {
        // assume seconds if value looks like seconds
        return v < 1e12 ? v * 1000 : v;
      }
      if (typeof v === 'string') {
        // support 'YYYY-MM-DD' or 'YYYY-MM-DD HH:mm:ss'
        const s = v.trim();
        const iso = s.includes(' ') ? s.replace(' ', 'T') : `${s}T00:00:00`;
        const t = Date.parse(iso);
        return Number.isNaN(t) ? 0 : t;
      }
      return 0;
    };
    const taNum = toMillis(a.updatedAt || a.publishedAt);
    const tbNum = toMillis(b.updatedAt || b.publishedAt);
    return tbNum - taNum;
  });
  return results;
}

function shanghaiDateTime() {
  const now = new Date();
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(now);
  const y = parts.find((p) => p.type === "year")?.value || "1970";
  const m = parts.find((p) => p.type === "month")?.value || "01";
  const d = parts.find((p) => p.type === "day")?.value || "01";
  const hh = parts.find((p) => p.type === "hour")?.value || "00";
  const mm = parts.find((p) => p.type === "minute")?.value || "00";
  const ss = parts.find((p) => p.type === "second")?.value || "00";
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`;
}

export async function GET(req: NextRequest) {
  const auth = ensureAuth(req);
  if (!auth.ok) return auth.res;
  const { searchParams } = new URL(req.url);
  const locale = (searchParams.get('locale') || 'zh').toLowerCase();
  if (!isLocale(locale)) return badRequest("Invalid locale; expected 'zh' or 'en'");
  const slug = (searchParams.get('slug') || '').trim();
  if (slug) {
    // Load single draft content
    const storage = getStorage();
    const key = postKey(locale, `${slug}`);
    try {
      const source = await storage.read(key);
      if (!source) return badRequest('Failed to read draft: not found', 404);
      const parsed = matter(source);
      const fm = parsed.data || {};
      const isDraft = (() => {
        const v = fm.draft as unknown;
        if (typeof v === 'boolean') return v;
        if (typeof v === 'number') return v === 1;
        if (typeof v === 'string') return ['true','yes','1'].includes(v.trim().toLowerCase());
        return false;
      })();
      if (!isDraft) return badRequest('Not a draft');
      return NextResponse.json({
        ok: true,
        draft: {
          slug,
          title: (fm.title as string) || slug,
          summary: (fm.summary as string) || '',
          content: parsed.content,
          publishedAt: (fm.publishedAt as string) || '',
          updatedAt: (fm.updatedAt as string) || '',
        },
      });
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : String(e);
      return badRequest(`Failed to read draft: ${errorMessage}`, 404);
    }
  }
  const drafts = await listDrafts(locale);
  return NextResponse.json({ ok: true, drafts });
}

export async function POST(req: NextRequest) {
  const auth = ensureAuth(req);
  if (!auth.ok) return auth.res;
  let body: { locale?: string; slug?: string; action?: 'publish' };
  try {
    body = await req.json();
  } catch {
    return badRequest("Invalid JSON body");
  }
  const locale = (body.locale || 'zh').toLowerCase();
  if (!isLocale(locale)) return badRequest("Invalid locale; expected 'zh' or 'en'");
  if (!body.slug) return badRequest('Missing slug');
  if (body.action !== 'publish') return badRequest('Invalid action');

  const storage = getStorage();
  const key = postKey(locale, body.slug);
  try {
    const source = await storage.read(key);
    if (!source) return badRequest('Failed to publish draft: not found', 404);
    const parsed = matter(source);
    if (!parsed.data || parsed.data.draft !== true) {
      return badRequest('Not a draft');
    }
    const dateTime = shanghaiDateTime();
    const newData = {
      ...parsed.data,
      draft: false,
      updatedAt: dateTime,
      // On publish, set publishedAt to the publish moment (Asia/Shanghai)
      publishedAt: dateTime,
    };
    const nextContent = matter.stringify(parsed.content, newData);
    await storage.write(key, nextContent);
    // Invalidate caches for this post and the posts list in this locale
    revalidateTag(`post-${locale}-${body.slug}`);
    revalidateTag(`posts-${locale}`);
    const url = locale === 'zh' ? `/blog/${body.slug}` : `/en/blog/${body.slug}`;
    return NextResponse.json({ ok: true, path: key, url, slug: body.slug });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    return badRequest(`Failed to publish draft: ${errorMessage}`, 500);
  }
}
