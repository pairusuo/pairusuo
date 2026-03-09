出海新人 ｜ Freshman in the field of website builder

简洁的个人博客，快速切换语言 ｜ Simple personal blog, switching languages quickly

基于 Next.js · Shadcn · Tailwind · MDX ｜ Based on Next.js · Shadcn · Tailwind · MDX

## 🚀 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/pairusuo/pairusuo.git your-project-name
cd your-project-name
```

### 2. 安装依赖

```bash
pnpm install
```

### 3. 配置语言，支持任意语言

1. 在 `src/messages/` 目录下创建新的语言文件，如 `fr.json`
2. 参考zh.json，复制现有语言文件的结构，并翻译内容
3. 在 `src/lib/i18n.ts` 中添加新语言的支持
4. 修改 `src/config/locale.js` 使用新语言

```javascript
// 选择你的语言: 'zh' | 'ja' | 'en'
export const LOCALE = 'zh';
```

### 4. 启动开发服务器

```bash
pnpm dev
pnpm dev:clean # 清除缓存启动服务
```

访问 [http://localhost:3000](http://localhost:3000) 查看效果。

## 推送到 GitHub 私有仓库

```bash
git remote set-url origin https://github.com/your-username/your-project-name.git
git add .
git commit -m "Initial commit"
git push origin main
```

## 📦 部署到Cloudflare Pages（推荐）

```bash
# 部署preview环境
pnpm deploy:preview

# 部署production环境
pnpm deploy:prod
```

部署过程会提示授权cloudflare

## Sitemap 逻辑

当前项目的 sitemap 不是框架自动扫描生成，而是由 `src/app/sitemap.xml/route.ts` 手动拼接 XML。

生成逻辑：

- `baseUrl` 来自 `NEXT_PUBLIC_SITE_URL`，未配置时默认使用 `https://pairusuo.top`
- 博客文章数据来自 `src/lib/mdx.ts` 的 `getAllPosts()`
- 只会收录 `status === 'published'` 的 `.mdx` 文章
- 当前固定收录的页面有：
  - `/`
  - `/blog`
  - `/tags`
  - `/links`
  - `/games/2048`
- 另外会为每一篇已发布文章生成一条 `/blog/[slug]`

`lastmod` 规则：

- 首页、`/blog`、`/tags` 使用“所有已发布文章里最新的 `updatedAt`”
- `/games/2048` 使用 sitemap 生成当下的时间
- 每篇文章使用自己的 `updatedAt`

`changefreq` 和 `priority` 当前是手写的固定值：

- `/`: `weekly`, `1.0`
- `/blog`: `weekly`, `0.9`
- `/tags`: `weekly`, `0.8`
- `/links`: `monthly`, `0.7`
- `/games/2048`: `monthly`, `0.7`
- `/blog/[slug]`: `monthly`, `0.8`

注意事项：

- 新增重要页面时，不会自动进入 sitemap，需要手动修改 `src/app/sitemap.xml/route.ts`
- 当前 sitemap 不包含 tag 详情页、links 页、rss 页、robots 页等路由
- 文章的 `updatedAt` 如果缺失或格式异常，会直接影响对应 `lastmod`
- `robots.txt` 由 `src/app/robots.txt/route.ts` 生成，并显式暴露：
  - `/sitemap.xml`
  - `/rss.xml`

本地验证方式：

```bash
pnpm dev
# 打开 http://localhost:3000/sitemap.xml
```

生产环境验证方式：

```bash
curl https://pairusuo.top/sitemap.xml
curl https://pairusuo.top/robots.txt
```

## 📄 许可证

MIT License

## 🙏 致谢

- [Next.js](https://nextjs.org/) - React 框架
- [Tailwind CSS](https://tailwindcss.com/) - CSS 框架
- [Shadcn/ui](https://ui.shadcn.com/) - UI 组件库
- [MDX](https://mdxjs.com/) - Markdown + React
- [Lucide](https://lucide.dev/) - 图标库
