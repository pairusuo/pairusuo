# Cloudflare Pages 部署指南

## 部署步骤

### 1. 创建 Cloudflare Pages 项目

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 **Pages** 页面
3. 点击 **Create a project**
4. 连接到 GitHub 仓库 `pairusuo/pairusuo`

### 2. 配置构建设置

```
Framework preset: Next.js
Build command: npm run build:cf
Output directory: out
Root directory: (留空)
```

### 3. 环境变量配置

在 **Settings** → **Environment variables** 中添加：

**生产环境 (Production)**:
```
NODE_ENV=production
R2_ACCOUNT_ID=<你的CF账户ID>
R2_ACCESS_KEY_ID=<R2访问密钥ID>
R2_SECRET_ACCESS_KEY=<R2秘密访问密钥>
R2_BUCKET=pairusuo-top
R2_PUBLIC_BASE=https://image.pairusuo.top
ADMIN_TOKEN=<管理员令牌>
```

**预览环境 (Preview)**:
```
NODE_ENV=development
# 可以使用相同的 R2 配置或者单独的测试桶
```

### 4. 域名配置

1. 在 **Custom domains** 中添加你的域名
2. 确保 DNS 记录正确指向 Cloudflare Pages
3. SSL/TLS 会自动配置

### 5. Functions 配置

Functions 文件会自动部署：
- `functions/api/admin/upload.ts`
- `functions/api/admin/posts.ts`
- `functions/api/admin/drafts.ts`
- `functions/api/admin/publish.ts`
- `functions/_middleware.ts`

### 6. 验证部署

部署完成后测试以下功能：
- [ ] 首页加载
- [ ] 中英文切换
- [ ] 博客文章显示
- [ ] 图片加载 (image.pairusuo.top)
- [ ] 管理界面 (需要 admin token)
- [ ] RSS 订阅
- [ ] Sitemap

## 性能优化

已启用的优化：
- ✅ 静态资源压缩
- ✅ 图片 CDN (R2)
- ✅ 边缘缓存
- ✅ HTTP/2 推送
- ✅ Brotli 压缩

## 监控和调试

1. **Analytics**: 在 CF Dashboard 查看流量统计
2. **Logs**: Functions 日志在 **Functions** → **View logs**
3. **Errors**: Real User Monitoring (RUM) 数据

## 故障排除

### 构建失败
- 检查环境变量是否正确设置
- 查看构建日志中的具体错误信息
- 确保 Node.js 版本兼容 (18.x+)

### 404 错误
- 确保 `_redirects` 文件正确复制到输出目录
- 检查路由配置是否正确

### API 错误
- 验证环境变量是否在 CF Pages 中正确设置
- 检查 R2 绑定配置
- 查看 Functions 执行日志

### 图片加载问题
- 确认 `image.pairusuo.top` 域名配置正确
- 检查 R2 桶权限设置
- 验证 CORS 配置

## 回滚步骤

如需回滚到 Vercel：
1. 修改 DNS 记录指向 Vercel
2. 确保 Vercel 项目仍在运行
3. 数据一致性已通过 R2 保持