export const runtime = "nodejs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";

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

  const contentRoot = path.join(process.cwd(), "content", "posts");
  const dir = path.join(contentRoot, locale);

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

  // Compute file path AFTER slug normalization/prefixing
  const filePath = path.join(dir, `${slug}.mdx`);

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
    // Create nested directories for slugs with subpaths, e.g. 2025/08/test
    const targetDir = path.dirname(filePath);
    await fs.mkdir(targetDir, { recursive: true });
    // If file exists, avoid overwriting accidentally
    try {
      await fs.access(filePath);
      return badRequest("Post already exists with the same slug", 409);
    } catch {
      // not exists, safe to write
    }
    await fs.writeFile(filePath, fileContent, "utf8");
  } catch (err: unknown) {
    return badRequest(`Failed to write file: ${err instanceof Error ? err.message : String(err)}`, 500);
  }

  const url = draft ? null : (locale === "zh" ? `/blog/${slug}` : `/en/blog/${slug}`);
  return NextResponse.json({ ok: true, path: filePath, url, slug, draft });
}
