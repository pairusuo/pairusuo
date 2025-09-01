import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getPostsByTag, getAllTags } from '@/lib/mdx'
import { BlogList } from '@/components/blog/blog-list'
import { Button } from '@/components/ui/button'
import { t } from '@/lib/i18n'

interface TagPageProps {
  params: {
    tag: string
  }
}

export async function generateStaticParams() {
  const tags = await getAllTags()
  return tags.map((tagData) => ({
    tag: encodeURIComponent(tagData.tag),
  }))
}

export async function generateMetadata({ params }: TagPageProps) {
  const tag = decodeURIComponent(params.tag)
  const posts = await getPostsByTag(tag)
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://pairusuo.top'
  
  return {
    title: `${tag} - ${t('nav.tags')} - ${t('meta.title')}`,
    description: t('tags.browseDescription').replace('{tag}', tag).replace('{count}', posts.length.toString()),
    keywords: `${tag},${t('tags.keywords')}`,
    openGraph: {
      title: `${tag} - ${t('nav.tags')}`,
      description: t('tags.browseDescription').replace('{tag}', tag).replace('{count}', posts.length.toString()),
      type: 'website',
      url: `${baseUrl}/tags/${encodeURIComponent(tag)}`,
    },
    twitter: {
      card: 'summary',
      title: `${tag} - ${t('nav.tags')}`,
      description: t('tags.browseDescription').replace('{tag}', tag).replace('{count}', posts.length.toString()),
    },
    alternates: {
      canonical: `${baseUrl}/tags/${encodeURIComponent(tag)}`,
    },
  }
}

export default async function TagPage({ params }: TagPageProps) {
  const tag = decodeURIComponent(params.tag)
  const posts = await getPostsByTag(tag)

  if (posts.length === 0) {
    notFound()
  }

  return (
    <div className="container mx-auto max-w-6xl px-6 py-8">
      <div className="bg-content-background rounded-xl shadow-sm border p-8">
        <div className="space-y-8">
        {/* Back Button */}
        <div>
          <Button variant="ghost" asChild>
            <Link href="/tags" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              {t('tags.backToList')}
            </Link>
          </Button>
        </div>

        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">
            {t('tags.tagPrefix')} <span className="text-primary">{tag}</span>
          </h1>
          <p className="text-muted-foreground">
            {t('tags.totalPosts').replace('{count}', posts.length.toString())}
          </p>
        </div>

        {/* Posts List */}
        <BlogList posts={posts} />
        </div>
      </div>
    </div>
  )
}