import { BlogList } from '@/components/blog/blog-list'
import { getAllPosts } from '@/lib/mdx'
import { t } from '@/lib/i18n'
import type { Metadata } from 'next'

export async function generateMetadata() {
  const posts = await getAllPosts()
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://pairusuo.top'
  
  return {
    title: `${t('nav.blog')} - ${t('meta.title')}`,
    description: t('blog.description'),
    keywords: t('blog.keywords'),
    openGraph: {
      title: `${t('nav.blog')} - ${t('meta.title')}`,
      description: t('blog.description'),
      type: 'website',
      url: `${baseUrl}/blog`,
    },
    twitter: {
      card: 'summary',
      title: `${t('nav.blog')} - ${t('meta.title')}`,
      description: t('blog.description'),
    },
    alternates: {
      canonical: `${baseUrl}/blog`,
    },
  }
}

export default async function BlogPage() {
  const posts = await getAllPosts()

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8 pb-20">
      <div className="space-y-12">
        {/* Header / Intro */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">{t('blog.title')}</h1>
          <p className="text-xl text-muted-foreground">
             {t('blog.subtitle')}
          </p>
          <div className="text-sm text-muted-foreground pt-2">
            {t('blog.postsCount').replace('{count}', posts.length.toString())}
          </div>
        </div>

        {/* Posts List */}
        <BlogList posts={posts} />
      </div>
    </div>
  )
}