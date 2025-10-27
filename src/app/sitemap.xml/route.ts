import { NextResponse } from 'next/server'
import { getAllPosts } from '@/lib/mdx'

export async function GET() {
  try {
    const posts = await getAllPosts()
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://pairusuo.top'
    const now = new Date().toISOString()
    
    // 获取最新文章的更新时间作为博客页面的lastmod
    const latestPostDate = posts.length > 0 
      ? new Date(Math.max(...posts.map(p => new Date(p.updatedAt).getTime()))).toISOString()
      : now
    
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${latestPostDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/blog</loc>
    <lastmod>${latestPostDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/tags</loc>
    <lastmod>${latestPostDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  ${posts.map(post => `
  <url>
    <loc>${baseUrl}/blog/${post.slug}</loc>
    <lastmod>${new Date(post.updatedAt).toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`).join('')}
</urlset>`

    return new NextResponse(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600', // 缓存1小时
      },
    })
  } catch (error) {
    console.error('Error generating sitemap:', error)
    return new NextResponse('Error generating sitemap', { status: 500 })
  }
}
