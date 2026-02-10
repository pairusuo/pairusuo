import Link from 'next/link'
import { getAllTags } from '@/lib/mdx'
import { t } from '@/lib/i18n'

export async function generateMetadata() {
  const tags = await getAllTags()
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://pairusuo.top'
  
  return {
    title: `${t('nav.tags')} - ${t('meta.title')}`,
    description: t('tags.subtitle').replace('{count}', tags.length.toString()),
    keywords: '',
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
    <div className="container mx-auto max-w-5xl px-4 py-8 pb-20">
      <div className="space-y-12">
        {/* Header */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">{t('tags.title')}</h1>
          <p className="text-xl text-muted-foreground">
            {t('tags.subtitle').replace('{count}', tags.length.toString())}
          </p>
        </div>

        {/* Tags Grid */}
        {tags.length > 0 ? (
          <div className="flex flex-wrap gap-4">
            {tags.map(({ tag, count }) => (
              <Link
                key={tag}
                href={`/tag/${encodeURIComponent(tag)}`}
                className="group flex items-center gap-2 rounded-full border border-muted bg-background px-4 py-2 transition-all hover:border-primary hover:text-primary active:scale-95"
              >
                <span className="font-medium">#{tag}</span>
                <span className="text-xs text-muted-foreground group-hover:text-primary/80">
                  {count}
                </span>
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
  )
}