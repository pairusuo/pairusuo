# 内容持久化方案（Vercel 只读磁盘）

本仓库现已统一采用 Cloudflare R2 存储文章内容与草稿，不再使用本地文件系统目录 `content/posts/...`。

本文记录“仅使用 Cloudflare R2”的持久化方案要点与环境变量说明。

---

## 现状
- 文章写入：`app/api/admin/publish/route.ts` 通过 `lib/storage.ts` 写入 R2（S3 兼容）。
- 草稿管理：`app/api/admin/drafts/route.ts` 通过 `lib/storage.ts` 读写 R2。
- 文章读取：`lib/posts.ts` 通过 `lib/storage.ts` 从 R2 读取并编译 MDX。
- 图片上传：`app/api/admin/upload/route.ts` 使用 R2；必要时可自定义公共访问域名。

## 目标
- 全环境（本地/预发/线上）统一使用 Cloudflare R2 持久化文章与草稿。
- 新文章发布后无需重新部署即可出现在站点（通过动态渲染或短缓存）。

## 方案概述：存储抽象 + 仅 R2 实现
1. `lib/storage.ts` 暴露统一接口，当前启用 R2 实现（可保留接口层以便未来替换）。
2. 写入与读取 API 全部通过 `storage.read/write/list/exists` 访问 R2：
   - key 约定：`posts/<locale>/<yyyy>/<mm>/<slug>.mdx`。
3. 渲染策略：
   - 博客列表页与详情页设置 `export const dynamic = 'force-dynamic'`（或短 `revalidate` + 发布后触发 On-Demand Revalidation），确保新增内容无需重新部署即可可见。

## 环境变量
沿用 `upload` 路由的 R2 环境变量：
- `ADMIN_TOKEN`
- `R2_ACCOUNT_ID`（或 `CF_ACCOUNT_ID`）
- `R2_ACCESS_KEY_ID`（或 `AWS_ACCESS_KEY_ID`）
- `R2_SECRET_ACCESS_KEY`（或 `AWS_SECRET_ACCESS_KEY`）
- `R2_BUCKET`（如：`pairusuo-top`）
- `R2_PUBLIC_BASE`（例如 `https://your-cdn-domain`，用于图片公开 URL）
- `R2_ENDPOINT`（可选，自定义 Endpoint）

## 权衡
- 优点：
  - 全环境一致的数据来源与行为
  - 无本地/线上差异，减少问题定位成本
  - 线上无需重建即可上新
- 可能的代价：
  - 本地开发需要配置 R2 访问凭据
  - 强静态缓存场景需配合再验证策略

## 实施步骤（已完成）
- [x] 统一通过 `lib/storage.ts` 访问 R2（读写、列举、存在性检查）
- [x] 改造读取与列表逻辑统一走 storage
- [x] 列表与详情页使用动态渲染/短缓存，发布后即可可见
- [x] 删除本地目录 `content/posts/` 与迁移脚本 `scripts/migrate-to-r2.js`

## 未来可选替代
- GitHub PR 流：Admin 通过 GitHub Contents API 提交 MDX，触发构建发布（简单但有延迟）。
- 数据库（Supabase / Vercel Postgres）：文章入库，灵活但改动大。
