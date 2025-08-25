// Cloudflare Functions 全局中间件
export async function onRequest(context: any) {
  const { request, next } = context;
  const response = await next();
  
  // 优化缓存策略
  const url = new URL(request.url);
  
  if (url.pathname.startsWith('/uploads/')) {
    // 图片资源永久缓存
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  } else if (url.pathname.startsWith('/blog/')) {
    // 博客内容适度缓存
    response.headers.set('Cache-Control', 'public, max-age=300, s-maxage=3600');
  }
  
  // 安全头
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // CORS 头 (如果需要)
  if (url.pathname.startsWith('/api/')) {
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, x-admin-token');
  }
  
  return response;
}