import Link from 'next/link'
import { getAllTags } from '@/lib/mdx'
import { t } from '@/lib/i18n'
import type { Metadata } from 'next'
import { BreadcrumbJsonLd, CollectionPageJsonLd } from '@/components/seo/jsonld'
import { createDefaultOgImage, defaultOgImage, siteUrl } from '@/lib/seo'

const canonical = `${siteUrl}/tags`

export async function generateMetadata(): Promise<Metadata> {
  const tags = await getAllTags()
  
  return {
    title: t('nav.tags'),
    description: t('tags.subtitle').replace('{count}', tags.length.toString()),
    keywords: 'tags, topics, blog tags, categories, pairusuo',
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      title: `${t('nav.tags')} | ${t('meta.title')}`,
      description: t('tags.subtitle').replace('{count}', tags.length.toString()),
      type: 'website',
      url: canonical,
      siteName: t('meta.title'),
      locale: 'en_US',
      images: [createDefaultOgImage(`${t('nav.tags')} | ${t('meta.title')}`)],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${t('nav.tags')} | ${t('meta.title')}`,
      description: t('tags.subtitle').replace('{count}', tags.length.toString()),
      images: [defaultOgImage],
    },
    alternates: {
      canonical,
    },
  }
}

export default async function TagsPage() {
  const tags = await getAllTags()

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8 pb-20">
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', item: 'https://pairusuo.top' },
          { name: 'Tags', item: canonical },
        ]}
      />
      <CollectionPageJsonLd
        name="pairusuo Tags"
        url={canonical}
        description={t('tags.subtitle').replace('{count}', tags.length.toString())}
      />
      <div className="space-y-12">
        {/* Header */}
        <div className="space-y-4">
          <h1 className="text-3xl font-bold tracking-tight">{t('tags.title')}</h1>
          <p className="text-base text-muted-foreground">
            {t('tags.subtitle').replace('{count}', tags.length.toString())}
          </p>
        </div>

        {/* Tags Grid */}
        {tags.length > 0 ? (
          <div className="flex flex-wrap gap-4">
            {tags.map(({ tag, count }) => (
              <Link
                key={tag}
                href={`/tags/${encodeURIComponent(tag)}`}
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
