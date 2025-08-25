// Cloudflare Functions 发布管理 API
// 保持与原 API 完全相同的逻辑和响应格式

interface Env {
  R2_BUCKET: R2Bucket;
  ADMIN_TOKEN: string;
}

function badRequest(message: string, status = 400) {
  return new Response(JSON.stringify({ error: message }), { 
    status, 
    headers: { "Content-Type": "application/json" } 
  });
}

function sanitizeSlug(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/--+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function postKey(locale: 'zh' | 'en', slug: string) {
  return `posts/${locale}/${slug}.mdx`;
}

// 简化的 frontmatter 解析器（避免 gray-matter 兼容性问题）
function parseFrontmatter(source: string) {
  const match = source.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
  if (!match) return { data: {}, content: source };
  
  const [, frontmatter, content] = match;
  const data: Record<string, any> = {};
  
  // 简单解析 YAML frontmatter
  frontmatter.split('\n').forEach(line => {
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      const key = line.substring(0, colonIndex).trim();
      let value: string | boolean = line.substring(colonIndex + 1).trim();
      
      // 去除引号
      if ((value.startsWith('"') && value.endsWith('"')) || 
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      
      // 处理布尔值
      if (value === 'true') value = true;
      else if (value === 'false') value = false;
      
      data[key] = value;
    }
  });
  
  return { data, content };
}

// R2 存储操作类
class CF_R2Storage {
  constructor(private bucket: R2Bucket) {}
  
  async read(key: string): Promise<string | null> {
    const object = await this.bucket.get(key);
    return object ? await object.text() : null;
  }
  
  async write(key: string, content: string): Promise<void> {
    await this.bucket.put(key, content, {
      httpMetadata: { contentType: 'text/markdown' },
    });
  }
  
  async exists(key: string): Promise<boolean> {
    const object = await this.bucket.head(key);
    return object !== null;
  }
}

export async function onRequestPost(context: { request: Request; env: Env }) {
  const { request, env } = context;
  
  // 身份验证
  const adminToken = env.ADMIN_TOKEN;
  const token = request.headers.get("x-admin-token");

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
    body = await request.json();
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

  // 防止目录遍历
  if (slug.includes("..")) {
    return badRequest("Invalid slug");
  }

  const storage = new CF_R2Storage(env.R2_BUCKET);

  // 生成上海时间
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
  const shDateTime = `${y}-${m}-${d} ${hh}:${mm}:${ss}`;

  // 如果 slug 没有目录结构，自动添加年月前缀
  if (slug && !slug.includes("/")) {
    slug = `${y}/${m}/${slug}`;
  }

  // 计算存储键值
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
      // 如果存在文件是草稿，当作更新处理
      const source = await storage.read(key);
      if (!source) return badRequest("Failed to write file: existing file unreadable", 500);
      
      const { data: fm } = parseFrontmatter(source);
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
      
      // 合并字段
      const newData = {
        ...fm,
        title: title || (fm as any).title || slug,
        summary: summary || (fm as any).summary || '',
        draft: Boolean(draft),
        updatedAt: shDateTime,
        publishedAt: draft ? ((fm as any).publishedAt || shDateTime) : shDateTime,
      } as Record<string, unknown>;
      
      const nextContent = content || parsed.content || '';
      const frontmatterLines = [
        '---',
        ...Object.entries(newData).map(([key, value]) => {
          if (typeof value === 'string' && (value.includes(':') || value.includes('\n'))) {
            return `${key}: "${value.replace(/"/g, '\\"')}"`;
          }
          return `${key}: ${value}`;
        }),
        '---'
      ];
      const nextFile = `${frontmatterLines.join('\n')}\n\n${nextContent}\n`;
      await storage.write(key, nextFile);
    } else {
      await storage.write(key, fileContent);
    }
  } catch (err: unknown) {
    return badRequest(`Failed to write file: ${err instanceof Error ? err.message : String(err)}`, 500);
  }

  const url = draft ? null : (locale === "zh" ? `/blog/${slug}` : `/en/blog/${slug}`);

  return new Response(JSON.stringify({ ok: true, path: key, url, slug, draft }), {
    headers: { "Content-Type": "application/json" },
  });
}