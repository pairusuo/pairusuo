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
    <div className="container mx-auto max-w-6xl px-4 py-4 sm:px-6 sm:py-6 md:py-8">
      <div className="bg-content-background rounded-xl shadow-sm border p-4 sm:p-6 md:p-8">
        <div className="space-y-8">
          {/* Posts Count */}
          <div className="text-center text-sm text-muted-foreground">
            {t('blog.postsCount').replace('{count}', posts.length.toString())}
          </div>

          {/* Posts List */}
          <BlogList posts={posts} />
        </div>
      </div>
    </div>
  )
}