出海新人，哥飞追随者 ｜ Freshman in the field of website builder, a follower of Ge Fei

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

修改 `src/config/locale.js` 文件：

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

## 📄 许可证

MIT License

## 🙏 致谢

- [Next.js](https://nextjs.org/) - React 框架
- [Tailwind CSS](https://tailwindcss.com/) - CSS 框架
- [Shadcn/ui](https://ui.shadcn.com/) - UI 组件库
- [MDX](https://mdxjs.com/) - Markdown + React
- [Lucide](https://lucide.dev/) - 图标库