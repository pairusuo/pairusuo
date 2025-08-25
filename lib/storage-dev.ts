// 开发环境模拟存储层
import { Storage } from './storage';

// 开发环境模拟数据 - 更完整的内容用于构建时预览
const mockPosts = {
  'posts/zh/2025/08/migration-to-cloudflare.mdx': `---
title: 迁移到 Cloudflare Pages 的完整指南
summary: 从 Vercel 迁移到 Cloudflare Pages 的详细步骤，包括静态导出、Functions 配置和域名设置。
publishedAt: "2025-08-25 08:00:00"
updatedAt: "2025-08-25 08:00:00"
draft: false
tags: ["Cloudflare", "Next.js", "迁移", "部署"]
---

本文详细介绍了如何将 Next.js 博客从 Vercel 完全迁移到 Cloudflare Pages，包括静态导出配置、Functions 重构、R2 存储集成等关键步骤。

## 为什么选择 Cloudflare Pages

Cloudflare Pages 提供了优秀的性能和成本优势...

## 迁移步骤

1. 配置静态导出
2. 重构 API 为 Functions
3. 配置 R2 存储
4. 部署和测试

迁移过程虽然复杂，但收益显著。`,

  'posts/zh/2025/08/about-pairusuo-code.mdx': `---
title: 关于 pairusuo 的技术博客
summary: 介绍这个技术博客的创建背景、技术栈选择和未来规划。
publishedAt: "2025-08-24 15:30:00"
updatedAt: "2025-08-24 15:30:00"
draft: false
tags: ["博客", "Next.js", "技术分享"]
---

欢迎来到 pairusuo 的技术博客！这里主要分享出海项目开发经验、前端技术探索和工具使用心得。

## 技术栈

- **前端框架**: Next.js 15 + React 19
- **样式方案**: Tailwind CSS 4
- **内容管理**: MDX + Cloudflare R2
- **部署平台**: Cloudflare Pages
- **国际化**: next-intl

## 内容方向

主要关注以下几个方向：
1. 出海项目开发实践
2. 现代前端技术探索  
3. 开发工具和效率提升
4. 技术架构设计心得

持续更新中...`,

  'posts/zh/2025/08/cloudflare-r2-object-storage.mdx': `---
title: Cloudflare R2 Object Storage 使用指南
summary: 详细介绍 Cloudflare R2 对象存储的配置、使用和最佳实践，包括 API 集成和性能优化。
publishedAt: "2025-08-22 14:20:00"
updatedAt: "2025-08-22 14:20:00"
draft: false
tags: ["Cloudflare", "R2", "对象存储", "CDN"]
---

Cloudflare R2 是一个高性能、低成本的对象存储服务，完全兼容 S3 API。本文将详细介绍如何配置和使用 R2 存储。

## R2 的优势

1. **零出口费用** - 相比 AWS S3，R2 不收取数据传输费用
2. **全球 CDN** - 自动通过 Cloudflare 的全球网络分发内容
3. **S3 兼容** - 可以直接使用现有的 S3 工具和 SDK

## 配置步骤

### 1. 创建 R2 存储桶

在 Cloudflare Dashboard 中创建新的 R2 存储桶...

### 2. 获取访问凭据

生成 R2 令牌和访问密钥...

## API 集成

使用 AWS SDK 连接 R2：

\`\`\`javascript
import { S3Client } from '@aws-sdk/client-s3';

const client = new S3Client({
  region: 'auto',
  endpoint: 'https://account-id.r2.cloudflarestorage.com',
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});
\`\`\`

## 性能优化

通过合理的配置，R2 可以提供出色的性能表现...`,

  'posts/zh/2025/08/markdown-basics.mdx': `---
title: Markdown 基础语法全指南（对照 GFM）
summary: 按章节系统介绍 Markdown 基本语法：段落与换行、标题、强调、引用、列表、代码、分割线、链接与图片、转义、表格、任务列表、脚注等，并给出最佳实践与常见坑。
publishedAt: "2025-08-20 10:15:00"
updatedAt: "2025-08-20 10:15:00"
draft: false
tags: ["Markdown", "写作", "语法指南"]
---

Markdown 是一种轻量级标记语言，广泛用于技术文档、博客写作等场景。本文将系统介绍 Markdown 的基础语法。

## 标题语法

Markdown 支持两种标题语法：

### ATX 风格标题

\`\`\`markdown
# 一级标题
## 二级标题  
### 三级标题
\`\`\`

### Setext 风格标题

\`\`\`markdown
一级标题
=======

二级标题
-------
\`\`\`

## 段落与换行

段落之间用空行分隔。如需在段落内换行，在行末添加两个空格。

## 强调语法

- **粗体**：\`**文本**\` 或 \`__文本__\`
- *斜体*：\`*文本*\` 或 \`_文本_\`
- ***粗斜体***：\`***文本***\`

## 列表语法

### 无序列表

\`\`\`markdown
- 项目一
- 项目二
  - 子项目
  - 子项目
\`\`\`

### 有序列表

\`\`\`markdown
1. 第一项
2. 第二项
3. 第三项
\`\`\`

## 代码语法

行内代码：\`\`code\`\`

代码块：
\`\`\`javascript
function hello() {
  console.log("Hello, Markdown!");
}
\`\`\`

## 链接和图片

链接：\`[文本](URL)\`

图片：\`![alt文本](图片URL)\`

## 表格语法（GFM）

\`\`\`markdown
| 列1 | 列2 | 列3 |
|-----|-----|-----|
| 行1 | 数据 | 数据 |
| 行2 | 数据 | 数据 |
\`\`\`

Markdown 的简洁语法让写作变得更加专注和高效。`
};

export class DevMockStorage implements Storage {
  async list(prefix: string): Promise<string[]> {
    return Object.keys(mockPosts).filter(key => key.startsWith(prefix));
  }
  
  async read(key: string): Promise<string | null> {
    return mockPosts[key as keyof typeof mockPosts] || null;
  }
  
  async write(key: string, content: string): Promise<void> {
    // 在开发环境中不实际写入
    console.log(`[DevMockStorage] Write to ${key}: ${content.length} chars`);
  }
  
  async exists(key: string): Promise<boolean> {
    return key in mockPosts;
  }
  
  async delete(key: string): Promise<void> {
    // 在开发环境中不实际删除
    console.log(`[DevMockStorage] Delete ${key}`);
  }
}