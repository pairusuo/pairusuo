import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { getAllPosts } from '@/lib/mdx'
import { t } from '@/lib/i18n'
import Image from 'next/image'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: t('meta.title'),
  description: t('meta.description'),
  keywords: t('meta.keywords'),
  authors: [{ name: t('meta.author') }],
  creator: t('meta.author'),
  publisher: t('meta.author'),
  alternates: {
    canonical: process.env.NEXT_PUBLIC_SITE_URL || 'https://pairusuo.top',
  },
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://pairusuo.top',
    title: t('meta.title'),
    description: t('meta.description'),
    siteName: t('meta.title'),
  },
  twitter: {
    card: 'summary_large_image',
    title: t('meta.title'),
    description: t('meta.description'),
    creator: '@yourusername',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default async function HomePage() {
  const posts = await getAllPosts()
  const featuredPosts = posts.slice(0, 4)

  return (
    <div className="container mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-6 md:py-8">
      <div className="bg-content-background rounded-xl shadow-sm border p-4 sm:p-6 md:p-8">
        {/* Welcome Section */}
        <section className="mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            {t('home.intro.title')}
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl">
            {t('home.intro.description')}
          </p>
        </section>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left: Latest Posts */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">{t('blog.latestPosts')}</h2>
              <Link 
                href="/blog" 
                className="text-primary hover:underline text-sm"
              >
                {t('home.viewAllPosts')}
              </Link>
            </div>
            
            <div className="space-y-6">
              {featuredPosts.length > 0 ? (
                featuredPosts.map((post) => (
                  <Link 
                    key={post.slug}
                    href={`/blog/${post.slug}`}
                    className="block border rounded-lg p-6 hover:shadow-md transition-all duration-200 hover:border-primary/50 group"
                  >
                    <div className="space-y-3">
                      <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">
                        {post.title}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>{new Date(post.createdAt).toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' })} {new Date(post.createdAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}</span>
                        <span>• 3 {t('home.readTime')}</span>
                      </div>
                      <p className="text-muted-foreground leading-relaxed line-clamp-2">
                        {post.excerpt}
                      </p>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">{t('blog.noPosts')}</p>
                </div>
              )}
            </div>
          </div>

          {/* Right: Sidebar */}
          <div className="space-y-8">
            {/* Author Card */}
            <div className="border rounded-lg p-6">
              <div className="flex items-center space-x-4 mb-4">
                <Image
                  src="/info.png"
                  alt={t('home.intro.avatar')}
                  width={60}
                  height={60}
                  className="rounded-full object-cover"
                />
                <div>
                  <h3 className="font-semibold text-lg">{t('home.author.name')}</h3>
                  <p className="text-sm text-muted-foreground">{t('home.author.bio')}</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                {t('home.author.description')}
              </p>
            </div>

            {/* Tags */}
            <div className="border rounded-lg p-6">
              <h3 className="font-semibold mb-4">{t('nav.tags')}</h3>
              <div className="flex flex-wrap gap-2">
                {(() => {
                  // 直接获取tagList数组
                  const messages = require(`@/messages/zh.json`);
                  const tagList = messages.home.tagList || [];
                  
                  return tagList.map((tag: any, i: number) => {
                    const hasUrl = tag.url && tag.url.trim() !== '';
                    
                    // 判断是否为十六进制颜色
                    const isHexColor = tag.color && tag.color.startsWith('#');
                    
                    // 设置样式
                    const tagStyle = isHexColor ? {
                      backgroundColor: tag.color,
                      color: '#ffffff'
                    } : {};
                    
                    const tagClassName = hasUrl 
                      ? (isHexColor ? '' : (tag.color || 'bg-muted'))
                      : 'bg-muted';
                    
                    return hasUrl ? (
                      <Link
                        key={i}
                        href={tag.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`px-3 py-1 ${tagClassName} rounded-full text-sm hover:opacity-80 transition-opacity`}
                        style={tagStyle}
                      >
                        {tag.text}
                      </Link>
                    ) : (
                      <span
                        key={i}
                        className="px-3 py-1 bg-muted rounded-full text-sm cursor-default"
                      >
                        {tag.text}
                      </span>
                    );
                  });
                })()}
              </div>
            </div>

            {/* WeChat QR */}
            <div className="border rounded-lg p-6 text-center">
              <h3 className="font-semibold mb-4">{t('home.wechat')}</h3>
              <Image
                src="/qrcode.jpg"
                alt={t('home.intro.contact')}
                width={120}
                height={120}
                className="mx-auto border border-muted rounded-lg object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}