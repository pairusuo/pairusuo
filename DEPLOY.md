# 本地部署指南

## 前置准备

1. 安装 Cloudflare Wrangler CLI：
```bash
npm install -g wrangler
```

2. 登录 Cloudflare 账户：
```bash
wrangler login
```

## 配置步骤

### 1. 配置 wrangler.toml

复制模板文件并填入真实配置：
```bash
cp wrangler.toml.example wrangler.toml
```

### 2. 获取 Cloudflare 配置信息

#### 获取账户 ID
1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 在右侧边栏找到 **Account ID**，复制

#### 获取 R2 API 令牌
1. 进入 **R2 Object Storage** 页面
2. 点击 **Manage R2 API tokens**
3. 点击 **Create API token**
4. 配置：
   - **Token name**: `pairusuo-build-access`
   - **Permissions**: **Object Read & Write**
   - **Specify bucket**: `pairusuo-top`
5. 复制生成的 **Access Key ID** 和 **Secret Access Key**

### 3. 填入 wrangler.toml 配置

编辑 `wrangler.toml`，替换以下占位符：
```toml
# 替换为你的真实配置
CLOUDFLARE_ACCOUNT_ID = "abcd1234efgh5678..."
R2_ACCESS_KEY_ID = "2f1a3b4c5d6e7f8g..."
R2_SECRET_ACCESS_KEY = "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6..."
```

## 部署命令

### 部署到生产环境
```bash
npm run deploy
```

### 部署到预览环境
```bash
npm run deploy:preview
```

### 仅构建（不部署）
```bash
npm run build:cf
```

## 部署流程说明

1. **构建**：`npm run build:cf` 生成静态文件到 `out/` 目录
2. **从 R2 获取内容**：构建时会通过 S3 API 从 R2 获取真实博客内容
3. **部署**：`wrangler pages deploy` 将静态文件部署到 Cloudflare Pages

## 构建日志验证

成功配置后，构建日志应显示：
```
[Storage] Using S3 API to connect R2 for build
```

如果显示以下内容，说明配置有误：
```
[Storage] Using dev mock storage for build - R2 S3 API not available
```

## 注意事项

- `wrangler.toml` 包含敏感信息，已加入 `.gitignore`，不会提交到 GitHub
- 每次内容更新后需要手动执行 `npm run deploy`
- 部署前可以使用 `npm run preview` 本地预览构建结果