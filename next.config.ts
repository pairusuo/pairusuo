import type { NextConfig } from "next";
import createMDX from "@next/mdx";
import remarkGfm from "remark-gfm";
import remarkFrontmatter from "remark-frontmatter";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import createNextIntlPlugin from "next-intl/plugin";

// Configure MDX with common remark/rehype plugins
const withMDX = createMDX({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [remarkGfm, remarkFrontmatter],
    rehypePlugins: [
      rehypeSlug,
      [rehypeAutolinkHeadings, { behavior: "wrap", properties: { className: "anchor" } }],
    ],
  },
});

const nextConfig: NextConfig = {
  // Cloudflare Pages 静态导出配置
  output: 'export',
  distDir: 'out',
  trailingSlash: true,
  // API 路由由 CF Functions 处理，无需特殊配置
  
  pageExtensions: ["ts", "tsx", "md", "mdx"],
  eslint: {
    // Avoid failing Vercel builds due to lint errors; we still lint locally/CI if desired
    ignoreDuringBuilds: true,
  },
  poweredByHeader: false,
  compress: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error', 'warn'] } : false,
  },
  images: {
    formats: ["image/avif", "image/webp"],
    // Tune responsive image size buckets to match our layouts
    // deviceSizes are widths for srcSet on layout-responsive images
    deviceSizes: [360, 414, 640, 750, 828, 1080],
    // imageSizes are widths for fixed-size images (e.g., avatars, thumbnails)
    imageSizes: [320, 480, 700],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
    remotePatterns: [
      {
        protocol: "https",
        hostname: "image.pairusuo.top",
        port: "",
        pathname: "/uploads/**",
      },
    ],
  },
  // headers 在静态导出模式下不生效，移动到 CF Functions 中间件处理
  // async headers() { ... }
};
const withNextIntl = createNextIntlPlugin();

export default withNextIntl(withMDX(nextConfig));
