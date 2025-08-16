export const runtime = "nodejs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import matter from "gray-matter";
import { getStorage, postKey } from "@/lib/storage";
import { revalidatePath, revalidateTag } from "next/cache";

function badRequest(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

function sanitizeSlug(input: string) {
  return input
    .trim()
    .toLowerCase()
    // Only keep a-z 0-9 -; convert everything else (including /) to '-'
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/--+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function POST(req: NextRequest) {
  const adminToken = process.env.ADMIN_TOKEN;
  const token = req.headers.get("x-admin-token");

  if (!adminToken) {
    return badRequest("Server not configured: ADMIN_TOKEN is missing", 500);
  }
  if (!token || token !== adminToken) {
    return badRequest("Unauthorized", 401);
  }

  let body: {
    locale?: string;
    title?: string;
    slug?: string;
    summary?: string;
    content?: string;
    draft?: boolean;
  };
  try {
    body = await req.json();
  } catch {
    return badRequest("Invalid JSON body");
  }

  const locale = (body.locale || "zh").toLowerCase();
  if (locale !== "zh" && locale !== "en") {
    return badRequest("Invalid locale; expected 'zh' or 'en'");
  }

  const title = (body.title || "").trim();
  let slug = sanitizeSlug(body.slug || "");
  const summary = (body.summary || "").trim();
  const content = (body.content || "").trim();
  const draft = Boolean(body.draft);

  if (!title || !slug || !content) {
    return badRequest("Missing required fields: title, slug, content");
  }

  // Prevent directory traversal
  if (slug.includes("..")) {
    return badRequest("Invalid slug");
  }

  const storage = getStorage();

  const now = new Date();
  // Asia/Shanghai local date-time components
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
  const shDateTime = `${y}-${m}-${d} ${hh}:${mm}:${ss}`; // YYYY-MM-DD HH:mm:ss in Asia/Shanghai

  // If slug has no directory, prefix with yyyy/mm
  if (slug && !slug.includes("/")) {
    slug = `${y}/${m}/${slug}`;
  }

  // Compute storage key AFTER slug normalization/prefixing
  const key = postKey(locale as "zh" | "en", slug);

  const frontmatter = [
    `---`,
    `title: ${title.replace(/"/g, '\\"')}`,
    summary ? `summary: ${summary.replace(/"/g, '\\"')}` : undefined,
    `publishedAt: "${shDateTime}"`,
    `updatedAt: "${shDateTime}"`,
    `draft: ${draft ? 'true' : 'false'}`,
    `---`,
  ]
    .filter(Boolean)
    .join("\n");

  const fileContent = `${frontmatter}\n\n${content}\n`;

  try {
    const exists = await storage.exists(key);
    if (exists) {
      // If an existing file is a draft, treat this as an update (save or publish)
      const source = await storage.read(key);
      if (!source) return badRequest("Failed to write file: existing file unreadable", 500);
      const parsed = matter(source);
      const fm = parsed.data || {};
      const isDraft = (() => {
        const v = fm.draft as unknown;
        if (typeof v === 'boolean') return v;
        if (typeof v === 'number') return v === 1;
        if (typeof v === 'string') {
          const s = v.trim().toLowerCase();
          return s === 'true' || s === 'yes' || s === '1';
        }
        return false;
      })();
      if (!isDraft) {
        return badRequest("Post already exists with the same slug", 409);
      }
      // Merge with current form fields; use incoming content as source of truth
      const newData = {
        ...fm,
        title: title || (fm as any).title || slug,
        summary: summary || (fm as any).summary || '',
        draft: Boolean(draft),
        updatedAt: shDateTime,
        publishedAt: draft ? ((fm as any).publishedAt || shDateTime) : shDateTime,
      } as Record<string, unknown>;
      const nextContent = content || parsed.content || '';
      const nextFile = matter.stringify(nextContent, newData);
      await storage.write(key, nextFile);
    } else {
      await storage.write(key, fileContent);
    }
  } catch (err: unknown) {
    return badRequest(`Failed to write file: ${err instanceof Error ? err.message : String(err)}`, 500);
  }

  const url = draft ? null : (locale === "zh" ? `/blog/${slug}` : `/en/blog/${slug}`);

  try {
    // 列表与元信息缓存标签
    revalidateTag(`posts-${locale}`);
    if (!draft) {
      // 详情页的元信息标签
      revalidateTag(`post-${locale}-${slug}`);
      // 列表页与详情页路径（可选）
      revalidatePath(locale === "zh" ? "/blog" : "/en/blog");
      revalidatePath(url!);
    }
  } catch {
    // revalidate 失败不应影响发布结果
  }
  return NextResponse.json({ ok: true, path: key, url, slug, draft });
}
