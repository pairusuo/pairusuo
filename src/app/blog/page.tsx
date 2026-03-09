import { BlogList } from '@/components/blog/blog-list'
import { getAllPosts } from '@/lib/mdx'
import { t } from '@/lib/i18n'
import type { Metadata } from 'next'
import { BreadcrumbJsonLd, CollectionPageJsonLd } from '@/components/seo/jsonld'
import { createDefaultOgImage, defaultOgImage, siteUrl, twitterHandle } from '@/lib/seo'

const canonical = `${siteUrl}/blog`

export async function generateMetadata(): Promise<Metadata> {
  const posts = await getAllPosts()
  
  return {
    title: t('nav.blog'),
    description: t('blog.description'),
    keywords: t('blog.keywords'),
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      title: `${t('nav.blog')} | ${t('meta.title')}`,
      description: t('blog.description'),
      type: 'website',
      url: canonical,
      siteName: t('meta.title'),
      locale: 'en_US',
      images: [createDefaultOgImage(`${t('nav.blog')} | ${t('meta.title')}`)],
    },
    twitter: {
      card: 'summary_large_image',
      site: twitterHandle,
      title: `${t('nav.blog')} | ${t('meta.title')}`,
      description: t('blog.description'),
      images: [defaultOgImage],
    },
    alternates: {
      canonical,
    },
  }
}

export default async function BlogPage() {
  const posts = await getAllPosts()

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8 pb-20">
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', item: 'https://pairusuo.top' },
          { name: 'Blog', item: canonical },
        ]}
      />
      <CollectionPageJsonLd
        name="pairusuo Blog"
        url={canonical}
        description={t('blog.description')}
      />
      <div className="space-y-12">
        {/* Header / Intro */}
        <div className="space-y-4">
          <h1 className="text-3xl font-bold tracking-tight">{t('blog.title')}</h1>
          <p className="text-base text-muted-foreground">
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
