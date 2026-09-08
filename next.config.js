const { PHASE_DEVELOPMENT_SERVER } = require('next/constants')

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  pageExtensions: ['js', 'jsx', 'mdx', 'ts', 'tsx'],
  experimental: {
    mdxRs: true,
  },
}

module.exports = (phase) => ({
  ...nextConfig,
  ...(phase === PHASE_DEVELOPMENT_SERVER
    ? {
        async rewrites() {
          return [...['', '/en', '/ja', '/ko'].map((locale) => ({
            source: `/tools/card-counter${locale}/`,
            destination: `/tools/card-counter${locale}/index.html`,
          })), {
            source: '/tools/desktop-clock/',
            destination: '/tools/desktop-clock/index.html',
          }]
        },
      }
    : {}),
})
