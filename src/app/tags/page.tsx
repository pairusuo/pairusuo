import Link from 'next/link'
import { getAllTags } from '@/lib/mdx'
import { t } from '@/lib/i18n'

export async function generateMetadata() {
  const tags = await getAllTags()
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://pairusuo.top'
  
  return {
    title: `${t('nav.tags')} - ${t('meta.title')}`,
    description: t('tags.subtitle').replace('{count}', tags.length.toString()),
    keywords: `${t('tags.keywords')},${tags.map(t => t.tag).join(',')}`,
    openGraph: {
      title: `${t('nav.tags')} - ${t('meta.title')}`,
      description: t('tags.subtitle').replace('{count}', tags.length.toString()),
      type: 'website',
      url: `${baseUrl}/tags`,
    },
    twitter: {
      card: 'summary',
      title: `${t('nav.tags')} - ${t('meta.title')}`,
      description: t('tags.subtitle').replace('{count}', tags.length.toString()),
    },
    alternates: {
      canonical: `${baseUrl}/tags`,
    },
  }
}

export default async function TagsPage() {
  const tags = await getAllTags()

  return (
    <div className="container mx-auto max-w-6xl px-4 py-4 sm:px-6 sm:py-6 md:py-8">
      <div className="bg-content-background rounded-xl shadow-sm border p-4 sm:p-6 md:p-8">
        <div className="space-y-8">
        {/* Tags Grid */}
        {tags.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {tags.map(({ tag, count }) => (
              <Link
                key={tag}
                href={`/tags/${encodeURIComponent(tag)}`}
                className="block p-4 border rounded-lg hover:shadow-md transition-all duration-200 hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary group"
              >
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">{tag}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t('tags.postsCount').replace('{count}', count.toString())}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">{t('tags.noTags')}</p>
          </div>
        )}
        </div>
      </div>
    </div>
  )
}