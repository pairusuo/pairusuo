// Cloudflare Functions 草稿管理 API
// 保持与原 API 完全相同的逻辑和响应格式

interface Env {
  R2_BUCKET: R2Bucket;
  ADMIN_TOKEN: string;
}

// 共用工具函数（与 posts.ts 保持一致）
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

function localePrefix(locale: 'zh' | 'en') {
  return `posts/${locale}/`;
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

// R2 存储操作类
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

// 草稿列表功能
async function listDrafts(storage: CF_R2Storage, locale: "zh" | "en") {
  const { default: matter } = await import('gray-matter');
  const prefix = localePrefix(locale);
  const results: Array<{ title: string; slug: string; path: string; publishedAt?: string; updatedAt?: string }> = [];
  const keys = await storage.list(prefix);
  
  for (const key of keys) {
    if (!key.endsWith('.mdx')) continue;
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
  
  // 按更新时间排序
  results.sort((a, b) => {
    const toMillis = (v: unknown) => {
      if (!v) return 0;
      if (v instanceof Date) return v.getTime();
      if (typeof v === 'number') {
        return v < 1e12 ? v * 1000 : v;
      }
      if (typeof v === 'string') {
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

// GET 请求处理
export async function onRequestGet(context: { request: Request; env: Env }) {
  const { request, env } = context;
  const auth = ensureAuth(request, env);
  if (!auth.ok) return auth.res;
  
  const url = new URL(request.url);
  const locale = (url.searchParams.get('locale') || 'zh').toLowerCase();
  if (!isLocale(locale)) return badRequest("Invalid locale; expected 'zh' or 'en'");
  
  const slug = (url.searchParams.get('slug') || '').trim();
  const storage = new CF_R2Storage(env.R2_BUCKET);
  
  if (slug) {
    // 加载单个草稿内容
    const key = postKey(locale, slug);
    try {
      const source = await storage.read(key);
      if (!source) return badRequest('Failed to read draft: not found', 404);
      
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
      
      if (!isDraft) return badRequest('Not a draft');
      
      return new Response(JSON.stringify({
        ok: true,
        draft: {
          slug,
          title: (fm.title as string) || slug,
          summary: (fm.summary as string) || '',
          content: parsed.content,
          publishedAt: (fm.publishedAt as string) || '',
          updatedAt: (fm.updatedAt as string) || '',
        },
      }), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : String(e);
      return badRequest(`Failed to read draft: ${errorMessage}`, 404);
    }
  }
  
  const drafts = await listDrafts(storage, locale);
  return new Response(JSON.stringify({ ok: true, drafts }), {
    headers: { "Content-Type": "application/json" },
  });
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
    if (!source) return badRequest('Draft not found', 404);
    
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
    
    if (!isDraft) return badRequest('Not a draft', 400);
    
    await storage.delete(key);
    return new Response(JSON.stringify({ ok: true, path: key, slug }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return badRequest(`Failed to delete draft: ${msg}`, 500);
  }
}

// PUT 请求处理
export async function onRequestPut(context: { request: Request; env: Env }) {
  const { request, env } = context;
  const auth = ensureAuth(request, env);
  if (!auth.ok) return auth.res;
  
  let body: { locale?: string; slug?: string; title?: string; summary?: string; content?: string };
  try {
    body = await request.json();
  } catch {
    return badRequest('Invalid JSON body');
  }
  
  const locale = (body.locale || 'zh').toLowerCase();
  if (!isLocale(locale)) return badRequest("Invalid locale; expected 'zh' or 'en'");
  if (!body.slug) return badRequest('Missing slug');
  
  const storage = new CF_R2Storage(env.R2_BUCKET);
  const key = postKey(locale, body.slug);
  
  try {
    const source = await storage.read(key);
    if (!source) return badRequest('Not a draft', 404);
    
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
    
    return new Response(JSON.stringify({ ok: true, path: key, slug: body.slug }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e: unknown) {
    return badRequest(`Failed to update draft: ${e instanceof Error ? e.message : String(e)}`, 500);
  }
}

// POST 请求处理（发布草稿）
export async function onRequestPost(context: { request: Request; env: Env }) {
  const { request, env } = context;
  const auth = ensureAuth(request, env);
  if (!auth.ok) return auth.res;
  
  let body: { locale?: string; slug?: string; action?: 'publish' };
  try {
    body = await request.json();
  } catch {
    return badRequest("Invalid JSON body");
  }
  
  const locale = (body.locale || 'zh').toLowerCase();
  if (!isLocale(locale)) return badRequest("Invalid locale; expected 'zh' or 'en'");
  if (!body.slug) return badRequest('Missing slug');
  if (body.action !== 'publish') return badRequest('Invalid action');

  const storage = new CF_R2Storage(env.R2_BUCKET);
  const key = postKey(locale, body.slug);
  
  try {
    const source = await storage.read(key);
    if (!source) return badRequest('Failed to publish draft: not found', 404);
    
    const { default: matter } = await import('gray-matter');
    const parsed = matter(source);
    if (!parsed.data || parsed.data.draft !== true) {
      return badRequest('Not a draft');
    }
    
    const dateTime = shanghaiDateTime();
    const newData = {
      ...parsed.data,
      draft: false,
      updatedAt: dateTime,
      publishedAt: dateTime,
    };
    
    const nextContent = matter.stringify(parsed.content, newData);
    await storage.write(key, nextContent);
    
    const url = locale === 'zh' ? `/blog/${body.slug}` : `/en/blog/${body.slug}`;
    return new Response(JSON.stringify({ ok: true, path: key, url, slug: body.slug }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    return badRequest(`Failed to publish draft: ${errorMessage}`, 500);
  }
}