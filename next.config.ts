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
  pageExtensions: ["ts", "tsx", "md", "mdx"],
  eslint: {
    // Avoid failing Vercel builds due to lint errors; we still lint locally/CI if desired
    ignoreDuringBuilds: true,
  },
};
const withNextIntl = createNextIntlPlugin();

export default withNextIntl(withMDX(nextConfig));
