# Pairusuo 项目 Cloudflare 迁移执行计划

## 前置要求确认

### ✅ 保持 R2 存储结构
当前 R2 存储目录结构将完全保持不变：
```
posts/
├── zh/           # 中文文章
│   └── 2025/08/
│       ├── cloudflare-r2-object-storage.mdx
│       └── markdown-basics.mdx
└── en/           # 英文文章（预留）

uploads/          # 图片文件
└── yyyy/mm/      # 按年月分类
    └── *.jpg|png|webp
```

### ✅ 逻辑优化策略
**只优化不修改**原则下的优化点：
1. **性能优化**：利用 CF 边缘缓存提升响应速度
2. **缓存策略**：优化 R2 读取缓存，减少重复请求
3. **构建优化**：启用静态导出，提升 SEO
4. **错误处理**：增强 API 错误处理和日志记录

### ✅ 多语言架构保持
- `next-intl` 配置完全保持
- 路由结构 `/zh/` 和 `/en/` 不变
- 消息文件 `messages/zh.json` 等保持
- 组件国际化逻辑不变

### ✅ 样式美化方案
在保持现有布局基础上，添加炫酷元素：
- **渐变背景**：添加微妙的渐变和光影效果
- **动画过渡**：增加悬停和页面切换动画
- **玻璃拟态**：header/footer 使用毛玻璃效果
- **暗黑模式优化**：更好的对比度和视觉层次

## 详细执行计划

### 阶段一：基础迁移配置 (第1天)

#### 1.1 创建 Cloudflare Pages 项目
```bash
# 1. 通过 Cloudflare Dashboard 创建项目
# 2. 连接 GitHub 仓库
# 3. 配置构建设置：
#    - 构建命令: npm run build
#    - 输出目录: out
#    - 环境变量迁移
```

#### 1.2 修改 Next.js 配置以支持静态导出
```typescript
// next.config.ts 
const nextConfig: NextConfig = {
  // 新增静态导出配置
  output: 'static',
  distDir: 'out',
  trailingSlash: true,
  
  // 保持现有配置
  pageExtensions: ["ts", "tsx", "md", "mdx"],
  eslint: { ignoreDuringBuilds: true },
  poweredByHeader: false,
  compress: true,
  
  // 调整图片配置
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [360, 414, 640, 750, 828, 1080],
    imageSizes: [320, 480, 700],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    remotePatterns: [{
      protocol: "https",
      hostname: "image.pairusuo.top", // 保持不变
      port: "",
      pathname: "/uploads/**", // 保持不变
    }],
  },
  
  // 优化缓存头
  async headers() {
    return [
      {
        source: "/:all*.(svg|jpg|jpeg|png|webp|avif|gif|ico)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/:all*.css",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },
};
```

#### 1.3 环境变量配置
在 Cloudflare Pages 设置中配置：
```bash
# R2 存储配置 (保持不变)
R2_ACCOUNT_ID=<现有值>
R2_ACCESS_KEY_ID=<现有值>  
R2_SECRET_ACCESS_KEY=<现有值>
R2_BUCKET=pairusuo-top
R2_PUBLIC_BASE=https://image.pairusuo.top
R2_ENDPOINT=<现有值>

# 管理配置 (保持不变)
ADMIN_TOKEN=<现有值>

# 新增优化配置
NODE_ENV=production
DEBUG_POSTS=0
```

### 阶段二：API Functions 重构 (第2-3天)

#### 2.1 创建 Cloudflare Functions 结构
```
functions/
├── api/
│   └── admin/
│       ├── upload.ts      # 图片上传 (保持逻辑，优化实现)
│       ├── drafts.ts      # 草稿管理 (保持逻辑)
│       ├── posts.ts       # 文章管理 (保持逻辑)
│       └── publish.ts     # 发布管理 (保持逻辑)
└── _middleware.ts         # 全局中间件
```

#### 2.2 重构上传 API (保持目录结构)
```typescript
// functions/api/admin/upload.ts
interface Env {
  R2_BUCKET: R2Bucket;
  ADMIN_TOKEN: string;
}

export async function onRequestPost(context: { request: Request; env: Env }) {
  const { request, env } = context;
  
  // 身份验证逻辑保持不变
  const adminToken = request.headers.get("x-admin-token");
  if (!adminToken || adminToken !== env.ADMIN_TOKEN) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File;
  const locale = formData.get("locale") as string || "zh";
  
  if (!file || !file.type.startsWith("image/")) {
    return new Response(JSON.stringify({ error: "Invalid file" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // 保持现有目录结构: uploads/yyyy/mm/
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const ext = file.name.split('.').pop()?.toLowerCase() || 'png';
  const randomId = crypto.randomUUID().slice(0, 10);
  const filename = `${randomId}.${ext}`;
  
  // 保持路径结构完全一致
  const key = `uploads/${yyyy}/${mm}/${filename}`;
  
  // 直接使用 R2 绑定 (性能优化)
  await env.R2_BUCKET.put(key, file.stream(), {
    httpMetadata: {
      contentType: file.type,
    },
  });

  // 返回格式保持不变
  return new Response(JSON.stringify({
    ok: true,
    path: key,
    url: `https://image.pairusuo.top/${key}`, // URL 格式保持不变
    r2Key: key,
    r2Url: `https://image.pairusuo.top/${key}`,
    locale,
  }), {
    headers: { "Content-Type": "application/json" },
  });
}
```

#### 2.3 适配存储层 (保持接口不变)
```typescript
// lib/storage-cf.ts - Cloudflare 专用实现
import { Storage } from './storage';

export class CloudflareR2Storage implements Storage {
  constructor(private bucket: R2Bucket) {}
  
  // 接口完全保持不变，只优化实现
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

// 工厂函数保持接口不变
export function getStorage(): Storage {
  // 运行时检测环境
  if (typeof R2_BUCKET !== 'undefined') {
    return new CloudflareR2Storage(R2_BUCKET as R2Bucket);
  }
  
  // 回退到现有实现
  const originalStorage = require('./storage');
  return originalStorage.getStorage();
}
```

### 阶段三：样式美化优化 (第4天)

#### 3.1 增强全局样式
```css
/* app/globals.css - 新增内容 */

/* 渐变背景优化 */
.gradient-bg {
  background: linear-gradient(135deg, 
    hsl(var(--background)) 0%,
    hsl(var(--background)/0.95) 50%,
    hsl(var(--background)) 100%
  );
}

/* 玻璃拟态效果 */
.glass-morphism {
  background: hsl(var(--background)/0.8);
  backdrop-filter: blur(10px);
  border: 1px solid hsl(var(--border)/0.2);
}

/* 悬停动画 */
.hover-lift {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.hover-lift:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px -5px hsl(var(--foreground)/0.1);
}

/* 渐变文字 */
.gradient-text {
  background: linear-gradient(135deg, 
    hsl(var(--primary)), 
    hsl(var(--primary)/0.8)
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* 脉冲动画 */
@keyframes pulse-glow {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.pulse-glow {
  animation: pulse-glow 2s ease-in-out infinite;
}
```

#### 3.2 组件样式增强
```typescript
// components/header.tsx - 美化增强
export function Header() {
  return (
    <header className="sticky top-0 z-40 glass-morphism">
      <div className="site-container h-14 flex items-center justify-between border-b border-border/20">
        <Link 
          href="/" 
          className="flex items-center gap-2 hover-lift focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:rounded-sm"
        >
          <Logo className="object-contain" />
          <span className="font-semibold text-lg gradient-text">
            pairusuo
          </span>
        </Link>
        
        {/* 导航保持不变，添加悬停效果 */}
        <nav className="hidden sm:flex items-center gap-4 text-sm">
          {navItems.map(item => (
            <Link 
              key={item.href}
              className="px-3 py-2 rounded-md transition-all duration-200 text-muted-foreground hover:text-foreground hover:bg-accent/50"
              href={item.href}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
```

### 阶段四：构建和部署优化 (第5天)

#### 4.1 优化构建配置
```json
// package.json 新增脚本
{
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "build:cf": "next build && cp _redirects out/", 
    "start": "next start",
    "lint": "next lint"
  }
}
```

```
# _redirects 文件
/api/* /api/:splat 200
/* /404.html 404
```

#### 4.2 性能监控和缓存策略
```typescript
// functions/_middleware.ts
export async function onRequest(context: any) {
  const { request, next } = context;
  const response = await next();
  
  // 优化缓存策略
  const url = new URL(request.url);
  
  if (url.pathname.startsWith('/uploads/')) {
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  } else if (url.pathname.startsWith('/blog/')) {
    response.headers.set('Cache-Control', 'public, max-age=300, s-maxage=3600');
  }
  
  // 安全头
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  return response;
}
```

### 阶段五：域名迁移和验证 (第6天)

#### 5.1 DNS 配置
```
# Cloudflare DNS 记录 (保持域名不变)
A    pairusuo.top         -> CF Pages IP
AAAA pairusuo.top         -> CF Pages IPv6  
CNAME www.pairusuo.top    -> pairusuo.top
CNAME image.pairusuo.top  -> 保持现有 R2 配置
```

#### 5.2 验证检查清单
- [ ] 首页加载正常
- [ ] 中英文路由切换正常
- [ ] 博客文章显示正常  
- [ ] 图片加载正常 (image.pairusuo.top)
- [ ] 管理界面正常
- [ ] 文章上传功能正常
- [ ] SEO 元数据正常
- [ ] RSS 订阅正常
- [ ] 暗黑模式切换正常

## 风险控制和回滚策略

### 分阶段验证
1. **测试环境**：先在 CF Pages 预览环境测试
2. **灰度发布**：使用 CF 流量分配功能
3. **监控告警**：设置关键指标监控
4. **快速回滚**：保持 Vercel 项目活跃状态

### 数据一致性
- **R2 存储**：完全保持不变，无数据迁移风险
- **文章内容**：路径和格式完全兼容
- **图片链接**：URL 格式保持一致

### 功能兼容性
- **管理界面**：逻辑不变，只优化实现
- **API 接口**：请求/响应格式完全保持
- **国际化**：路由和消息文件不变

## 预期效果

### 性能提升
- **首屏加载**：预计提升 30-40%
- **全球访问**：CF 边缘网络覆盖
- **缓存命中率**：提升至 90%+

### 成本节约
- **Vercel Pro**: $20/月 → **CF Pages**: $0-5/月
- **函数调用**：包含在 CF 免费额度内
- **带宽费用**：大幅降低

### 用户体验
- **视觉效果**：更现代的 UI 设计
- **交互动画**：流畅的页面切换
- **响应速度**：更快的加载时间

## 迁移时间表

| 时间 | 阶段 | 主要任务 | 验收标准 |
|------|------|----------|----------|
| 第1天 | 基础配置 | CF Pages 项目创建、Next.js 配置调整 | 静态站点正常构建 |
| 第2-3天 | API 重构 | Functions 开发、存储层适配 | 所有 API 功能正常 |
| 第4天 | 样式优化 | UI 美化、动画添加 | 视觉效果达预期 |
| 第5天 | 构建优化 | 性能调优、缓存策略 | 性能指标达标 |
| 第6天 | 域名切换 | DNS 配置、功能验证 | 全功能正常运行 |

总计：**6天完整迁移**，风险可控，用户体验显著提升。