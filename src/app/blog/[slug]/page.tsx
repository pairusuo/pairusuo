import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getPostBySlug, getAllPosts } from '@/lib/mdx'
import { MDXContent } from '@/components/blog/mdx-content'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'
import { t } from '@/lib/i18n'
import { ArticleJsonLd, BreadcrumbJsonLd } from '@/components/seo/jsonld'

interface BlogPostPageProps {
  params: {
    slug: string
  }
}

export async function generateStaticParams() {
  const posts = await getAllPosts()
  return posts.map((post) => ({
    slug: post.slug,
  }))
}

export async function generateMetadata({ params }: BlogPostPageProps) {
  const post = await getPostBySlug(params.slug)
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://pairusuo.top'
  
  if (!post) {
    return {
      title: t('common.notFound'),
    }
  }

  return {
    title: `${post.title} - ${t('meta.title')}`,
    description: post.excerpt,
    keywords: post.tags.join(', '),
    authors: post.author ? [{ name: post.author }] : undefined,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.createdAt,
      modifiedTime: post.updatedAt,
      authors: post.author ? [post.author] : undefined,
      tags: post.tags,
      url: `${baseUrl}/blog/${post.slug}`,
      images: post.coverImage ? [
        {
          url: post.coverImage,
          width: 1200,
          height: 630,
          alt: post.title,
        }
      ] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: post.coverImage ? [post.coverImage] : undefined,
    },
    alternates: {
      canonical: `${baseUrl}/blog/${post.slug}`,
    },
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const post = await getPostBySlug(params.slug)

  if (!post) {
    notFound()
  }
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://pairusuo.top'

  return (
    <div className="container mx-auto max-w-6xl px-4 py-4 sm:px-6 sm:py-6 md:py-8">
      <div className="bg-content-background rounded-xl shadow-sm border p-4 sm:p-6 md:p-8">
        <div className="max-w-4xl mx-auto">
        {/* GEO: Structured data to improve AI comprehension and citation */}
        <BreadcrumbJsonLd
          items={[
            { name: t('nav.home'), item: baseUrl },
            { name: t('blog.title'), item: `${baseUrl}/blog` },
            { name: post.title, item: `${baseUrl}/blog/${post.slug}` },
          ]}
        />
        <ArticleJsonLd
          url={`${baseUrl}/blog/${post.slug}`}
          title={post.title}
          description={post.excerpt}
          images={post.coverImage ? [post.coverImage] : undefined}
          datePublished={post.createdAt}
          dateModified={post.updatedAt}
          authorName={post.author}
          keywords={post.tags}
        />
        {/* Back Button */}
        <div className="mb-8">
          <Button variant="ghost" asChild>
            <Link href="/blog" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              {t('blog.backToList')}
            </Link>
          </Button>
        </div>

        {/* Article Header */}
        <header className="mb-8 space-y-4">
          <h1 className="text-4xl font-bold">{post.title}</h1>
          
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <time dateTime={post.createdAt}>
              {t('blog.publishedAt')} {new Date(post.createdAt).toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' })} {new Date(post.createdAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
            </time>
            {post.updatedAt !== post.createdAt && (
              <time dateTime={post.updatedAt}>
                {t('blog.updatedAt')} {new Date(post.updatedAt).toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' })} {new Date(post.updatedAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
              </time>
            )}
            {post.author && (
              <span>{t('blog.author')}: {post.author}</span>
            )}
          </div>

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-muted-foreground">{t('blog.tags')}:</span>
              {post.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/tags/${encodeURIComponent(tag)}`}
                  className="inline-block px-2 py-1 text-xs bg-secondary text-secondary-foreground rounded hover:bg-secondary/80 transition-colors"
                >
                  {tag}
                </Link>
              ))}
            </div>
          )}
        </header>

        {/* Article Content */}
        <article className="prose prose-lg max-w-none">
          <MDXContent source={post.content} />
        </article>

        {/* Footer */}
        <footer className="mt-12 pt-8 border-t">
          <div className="text-center">
            <Button variant="outline" asChild>
              <Link href="/blog">
                {t('blog.backToList')}
              </Link>
            </Button>
          </div>
        </footer>
        </div>
      </div>
    </div>
  )
}
