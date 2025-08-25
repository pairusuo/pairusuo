// Cloudflare Functions 文章管理 API
// 保持与原 API 完全相同的逻辑和响应格式

interface Env {
  R2_BUCKET: R2Bucket;
  ADMIN_TOKEN: string;
}

// 共用工具函数（保持原逻辑）
function badRequest(message: string, status = 400) {
  return new Response(JSON.stringify({ error: message }), { 
    status, 
    headers: { "Content-Type": "application/json" } 
  });
}

function ensureAuth(request: Request, env: Env) {
  const adminToken = env.ADMIN_TOKEN;
  const token = request.headers.get("x-admin-token");
  if (!adminToken) return { ok: false, res: badRequest("Server not configured: ADMIN_TOKEN is missing", 500) } as const;
  if (!token || token !== adminToken) return { ok: false, res: badRequest("Unauthorized", 401) } as const;
  return { ok: true } as const;
}

function isLocale(v: string): v is "zh" | "en" {
  return v === "zh" || v === "en";
}

function postKey(locale: 'zh' | 'en', slug: string) {
  return `posts/${locale}/${slug}.mdx`;
}

// 简化的存储操作（直接使用 R2）
class CF_R2Storage {
  constructor(private bucket: R2Bucket) {}
  
  async list(prefix: string): Promise<string[]> {
    const objects = await this.bucket.list({ prefix });
    return objects.objects.map(obj => obj.key);
  }
  
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
  
  async delete(key: string): Promise<void> {
    await this.bucket.delete(key);
  }
}

// 简化的文章元数据获取（保持原逻辑但去除缓存依赖）
async function getAllPostMeta(storage: CF_R2Storage, locale: 'zh' | 'en') {
  const { default: matter } = await import('gray-matter');
  
  const prefix = `posts/${locale}/`;
  const keys = await storage.list(prefix);
  const mdxKeys = keys.filter((k) => k.endsWith('.mdx'));
  
  const metasPromises = mdxKeys.map(async (key) => {
    const slug = key.substring(prefix.length).replace(/\.mdx$/, '');
    const source = await storage.read(key);
    if (!source) return null;
    
    const { content, data } = matter(source);
    return {
      title: (data as any).title || slug,
      slug,
      publishedAt: (data as any).publishedAt ? String((data as any).publishedAt) : '',
      updatedAt: (data as any).updatedAt ? String((data as any).updatedAt) : '',
      draft: (data as any).draft ?? false,
    };
  });
  
  const metasRaw = await Promise.all(metasPromises);
  return metasRaw.filter((m): m is NonNullable<typeof m> => !!m && !m.draft);
}

// GET 请求处理
export async function onRequestGet(context: { request: Request; env: Env }) {
  const { request, env } = context;
  
  const auth = ensureAuth(request, env);
  if (!auth.ok) return auth.res;
  
  const url = new URL(request.url);
  const locale = (url.searchParams.get('locale') || 'zh').toLowerCase();
  if (!isLocale(locale)) return badRequest("Invalid locale; expected 'zh' or 'en'");
  
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10) || 1);
  const pageSizeRaw = Math.max(1, parseInt(url.searchParams.get('pageSize') || '10', 10) || 10);
  const pageSize = Math.min(50, pageSizeRaw);

  try {
    const storage = new CF_R2Storage(env.R2_BUCKET);
    const all = await getAllPostMeta(storage, locale);
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
    
    return new Response(JSON.stringify({ total, page, pageSize, posts }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return badRequest(`Failed to list posts: ${msg}`, 500);
  }
}

// DELETE 请求处理
export async function onRequestDelete(context: { request: Request; env: Env }) {
  const { request, env } = context;
  
  const auth = ensureAuth(request, env);
  if (!auth.ok) return auth.res;
  
  const url = new URL(request.url);
  const locale = (url.searchParams.get('locale') || 'zh').toLowerCase();
  if (!isLocale(locale)) return badRequest("Invalid locale; expected 'zh' or 'en'");
  
  const slug = (url.searchParams.get('slug') || '').trim();
  if (!slug) return badRequest('Missing slug');

  const storage = new CF_R2Storage(env.R2_BUCKET);
  const key = postKey(locale, slug);
  
  try {
    const source = await storage.read(key);
    if (!source) return badRequest('Post not found', 404);
    
    const { default: matter } = await import('gray-matter');
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
    
    return new Response(JSON.stringify({ ok: true, path: key, slug }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return badRequest(`Failed to delete post: ${msg}`, 500);
  }
}