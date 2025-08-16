export const runtime = "nodejs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import matter from "gray-matter";
import { getStorage, postKey } from "@/lib/storage";
import { revalidateTag } from "next/cache";
import { getAllPostMeta } from "@/lib/posts";

function badRequest(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function GET(req: NextRequest) {
  const auth = ensureAuth(req);
  if (!auth.ok) return auth.res;
  const { searchParams } = new URL(req.url);
  const locale = (searchParams.get('locale') || 'zh').toLowerCase();
  if (!isLocale(locale)) return badRequest("Invalid locale; expected 'zh' or 'en'");
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);
  const pageSizeRaw = Math.max(1, parseInt(searchParams.get('pageSize') || '10', 10) || 10);
  const pageSize = Math.min(50, pageSizeRaw);

  try {
    const all = await getAllPostMeta(locale);
    const total = all.length;
    const start = (page - 1) * pageSize;
    const end = Math.min(start + pageSize, total);
    const slice = start >= total ? [] : all.slice(start, end);
    const posts = slice.map((m) => ({
      title: m.title,
      slug: m.slug,
      path: postKey(locale, m.slug),
      publishedAt: m.publishedAt,
      updatedAt: m.updatedAt,
    }));
    return NextResponse.json({ total, page, pageSize, posts });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return badRequest(`Failed to list posts: ${msg}`, 500);
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
    if (!source) return badRequest('Post not found', 404);
    const parsed = matter(source);
    const fm = parsed.data || {};
    const isDraft = (() => {
      const v = fm.draft as unknown;
      if (typeof v === 'boolean') return v;
      if (typeof v === 'number') return v === 1;
      if (typeof v === 'string') return ['true','yes','1'].includes(v.trim().toLowerCase());
      return false;
    })();
    if (isDraft) return badRequest('Cannot delete draft via posts endpoint', 400);
    await storage.delete(key);
    // Invalidate caches for this post and the posts list in this locale
    revalidateTag(`post-${locale}-${slug}`);
    revalidateTag(`posts-${locale}`);
    return NextResponse.json({ ok: true, path: key, slug });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return badRequest(`Failed to delete post: ${msg}`, 500);
  }
}
