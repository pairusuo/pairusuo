import Link from 'next/link'
import { getAllPosts } from '@/lib/mdx'
import { t } from '@/lib/i18n'
import type { Metadata } from 'next'
import { HeroSection } from '@/components/home/HeroSection'
import { SocialLinks } from '@/components/home/SocialLinks'

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
  const featuredPosts = posts.slice(0, 10) // Show top 10 posts
  const messages = require(`@/messages/zh.json`)
  const features = messages.home.intro.features || []

  return (
    <div className="container mx-auto max-w-5xl px-4 pb-20">
      
      {/* Hero Section */}
      <HeroSection 
        title={t('home.intro.title')}
        introDescription={t('home.intro.description')}
        features={features}
      />

      {/* Latest Posts Section */}
      <section className="mt-12">
        <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold tracking-tight">{t('blog.latestPosts')}</h2>
            <Link 
              href="/blog" 
              className="text-muted-foreground hover:text-primary transition-colors text-sm font-medium"
            >
              {t('home.viewAllPosts')} →
            </Link>
        </div>

        <div className="flex flex-col space-y-8">
          {featuredPosts.length > 0 ? (
            featuredPosts.map((post) => (
              <Link 
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group block"
              >
                <article className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 sm:gap-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold group-hover:text-primary transition-colors mb-2">
                      {post.title}
                    </h3>
                    <p className="text-muted-foreground line-clamp-2 text-sm leading-relaxed">
                      {post.excerpt}
                    </p>
                  </div>
                  <div className="shrink-0 text-sm text-muted-foreground font-mono mt-1 sm:mt-0">
                    {new Date(post.createdAt).toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' })}
                  </div>
                </article>
              </Link>
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">{t('blog.noPosts')}</p>
            </div>
          )}
        </div>
      </section>

      {/* Social Links Footer (Mobile/Extra) */}
      <div className="mt-20 pt-10 border-t flex flex-col items-center justify-center space-y-4">
          <p className="text-sm text-muted-foreground">Find me on</p>
          <SocialLinks />
      </div>

    </div>
  )
}
