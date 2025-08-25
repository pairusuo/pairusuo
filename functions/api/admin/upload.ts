// Cloudflare Functions 上传 API
// 保持与原 API 完全相同的逻辑和响应格式

interface Env {
  R2_BUCKET: R2Bucket;
  ADMIN_TOKEN: string;
  R2_PUBLIC_BASE?: string;
}

function randomId(len = 10): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let s = "";
  for (let i = 0; i < len; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

export async function onRequestPost(context: { request: Request; env: Env }) {
  const { request, env } = context;
  
  // 身份验证逻辑保持不变
  const adminTokenHeader = request.headers.get("x-admin-token") || "";
  if (!adminTokenHeader || adminTokenHeader !== env.ADMIN_TOKEN) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const form = await request.formData();
  const file = form.get("file") as File | null;
  const locale = String(form.get("locale") || "zh");
  
  if (!file || !(file instanceof File)) {
    return new Response(JSON.stringify({ error: "No file" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
  
  if (!file.type.startsWith("image/")) {
    return new Response(JSON.stringify({ error: "Invalid type" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // 保持完全相同的文件路径逻辑
  const now = new Date();
  const yyyy = String(now.getFullYear());
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const ext = (file.name.split(".").pop() || "png").toLowerCase();
  const name = `${randomId(10)}.${ext}`;
  
  // 保持 R2 目录结构完全不变: uploads/yyyy/mm/
  const r2Key = `uploads/${yyyy}/${mm}/${name}`;
  
  try {
    // 使用 CF R2 绑定直接上传（性能优化）
    await env.R2_BUCKET.put(r2Key, file.stream(), {
      httpMetadata: {
        contentType: file.type,
      },
    });
    
    // 构建 URL，保持格式完全一致
    const publicBase = env.R2_PUBLIC_BASE || "https://image.pairusuo.top";
    const r2Url = `${publicBase}/${r2Key}`;
    
    // 返回格式与原 API 完全一致
    return new Response(JSON.stringify({
      ok: true,
      path: r2Key,
      url: r2Url,
      r2Key,
      r2Url,
      locale,
    }), {
      headers: { "Content-Type": "application/json" },
    });
    
  } catch (e) {
    console.error("R2 upload failed:", e);
    return new Response(JSON.stringify({
      error: "Upload failed",
      details: e instanceof Error ? e.message : String(e),
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}