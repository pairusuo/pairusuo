export const runtime = "nodejs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";
import matter from "gray-matter";

function badRequest(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

function ensureAuth(req: NextRequest) {
  const adminToken = process.env.ADMIN_TOKEN;
  const token = req.headers.get("x-admin-token");
  if (!adminToken) return { ok: false, res: badRequest("Server not configured: ADMIN_TOKEN is missing", 500) } as const;
  if (!token || token !== adminToken) return { ok: false, res: badRequest("Unauthorized", 401) } as const;
  return { ok: true } as const;
}

const CONTENT_ROOT = path.join(process.cwd(), "content", "posts");

function isLocale(v: string): v is "zh" | "en" {
  return v === "zh" || v === "en";
}

async function listDrafts(locale: "zh" | "en") {
  const baseDir = path.join(CONTENT_ROOT, locale);
  const results: Array<{ title: string; slug: string; path: string; publishedAt?: string; updatedAt?: string }> = [];
  async function walk(dir: string, relBase: string) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      const rel = path.relative(baseDir, full);
      if (entry.isDirectory()) {
        await walk(full, rel);
      } else if (entry.isFile() && entry.name.endsWith(".mdx")) {
        const slug = rel.replace(/\.mdx$/, '').split(path.sep).join('/');
        const source = await fs.readFile(full, 'utf8');
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
            title: data.title || slug,
            slug,
            path: full,
            publishedAt: data.publishedAt || '',
            updatedAt: data.updatedAt || '',
          });
        }
      }
    }
  }
  try {
    await walk(baseDir, '');
  } catch (e) {
    // ignore if directory not exists
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

  const filePath = path.join(CONTENT_ROOT, locale, `${body.slug}.mdx`);
  try {
    const source = await fs.readFile(filePath, 'utf8');
    const parsed = matter(source);
    if (!parsed.data || parsed.data.draft !== true) {
      return badRequest('Not a draft');
    }
    const dateTime = shanghaiDateTime();
    const newData = {
      ...parsed.data,
      draft: false,
      updatedAt: dateTime,
      publishedAt: parsed.data.publishedAt || dateTime,
    };
    const nextContent = matter.stringify(parsed.content, newData);
    await fs.writeFile(filePath, nextContent, 'utf8');
    const url = locale === 'zh' ? `/blog/${body.slug}` : `/en/blog/${body.slug}`;
    return NextResponse.json({ ok: true, path: filePath, url, slug: body.slug });
  } catch (err: any) {
    return badRequest(`Failed to publish draft: ${err?.message || String(err)}`, 500);
  }
}
