# pairusuo

简洁的个人博客，支持多语言。

基于 Next.js · Shadcn · Tailwind · MDX

## 技术栈

- Next.js 15 (App Router), React 19
- Tailwind CSS v4 (@tailwindcss/postcss)
- MDX + `next-mdx-remote/rsc`
- next-intl（多语言 / i18n）
- rehype-pretty-code + Shiki（代码高亮）

## 开发

```bash
npm install
npm run dev
# 打开 http://localhost:3000
```

- 首页展示当前语言最新 10 篇文章
- ISR：页面默认 300s 重新验证

## 脚本

- `npm run dev` 启动开发服务
- `npm run build` 生产构建
- `npm run start` 启动生产服务

## 内容与多语言

- 文章：`content/posts/{locale}/.../*.mdx`
- 文案：`messages/zh.json`、`messages/en.json`
- 时间展示：东八区（Asia/Shanghai）格式化，页面显示为 `YYYY-MM-DD HH:mm:ss`（无 `T`/`Z`）
- Slug 规则：仅允许小写 `a-z`、数字 `0-9` 和短横线 `-`（无需输入 `/`）
- 自动目录：Admin 发布/保存草稿时，若 slug 不含目录，自动按当前年月前缀 `YYYY/MM/slug`
- 页面路径：中文 `/blog/YYYY/MM/slug`，英文 `/en/blog/YYYY/MM/slug`
- 前言示例（frontmatter）：

```md
---
title: 标题
summary: 摘要
tags: [tag1, tag2]
publishedAt: 2025-08-10 17:52:43
updatedAt: 2025-08-10 17:52:43
draft: false
---
```

## 部署

- 可部署到任意支持 Node 的平台（如 Vercel）
- 参考：https://nextjs.org/docs/app/building-your-application/deploying

---

# pairusuo (EN)

A minimal personal blog with i18n.

Built with Next.js · Shadcn · Tailwind · MDX

## Tech Stack

- Next.js 15 (App Router), React 19
- Tailwind CSS v4 (@tailwindcss/postcss)
- MDX + `next-mdx-remote/rsc`
- next-intl (i18n)
- rehype-pretty-code + Shiki (code highlighting)

## Development

```bash
npm install
npm run dev
# open http://localhost:3000
```

- Home shows latest 10 posts in the current locale
- ISR: revalidate every 300s

## Scripts

- `npm run dev` start dev server
- `npm run build` production build
- `npm run start` start production server

## Content & i18n

- Posts: `content/posts/{locale}/.../*.mdx`
- Messages: `messages/zh.json`, `messages/en.json`
- Datetime: Asia/Shanghai timezone, displayed as `YYYY-MM-DD HH:mm:ss` (no `T`/`Z`)
- Slug rules: only `a-z`, `0-9`, and `-` (no `/` needed)
- Auto directories: when publishing/saving drafts via Admin, if slug has no directory, prefix with current `YYYY/MM/slug`
- Page URL: Chinese `/blog/YYYY/MM/slug`, English `/en/blog/YYYY/MM/slug`
- Frontmatter example:

```md
---
title: Title
summary: Summary
tags: [tag1, tag2]
publishedAt: 2025-08-10 17:52:43
updatedAt: 2025-08-10 17:52:43
draft: false
---
```

## Deployment

- Deploy to any Node-capable platform (e.g. Vercel)
- Docs: https://nextjs.org/docs/app/building-your-application/deploying

