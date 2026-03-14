import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowUpRight, Wrench } from 'lucide-react'
import { BreadcrumbJsonLd, CollectionPageJsonLd } from '@/components/seo/jsonld'
import { t } from '@/lib/i18n'
import { createDefaultOgImage, defaultOgImage, siteUrl, twitterHandle } from '@/lib/seo'

const canonical = `${siteUrl}/tools`

const tools = [
  {
    name: 'Card Counter',
    href: 'https://cardcounter.pairusuo.top',
    descriptionKey: 'cardCounter',
  },
  {
    name: 'Desktop Clock',
    href: 'https://clock.pairusuo.top',
    descriptionKey: 'desktopClock',
  },
  {
    name: 'Keyword ROI Calculator',
    href: 'https://roi-calculator.pairusuo.top/',
    descriptionKey: 'keywordRoi',
  },
  {
    name: 'Data-table',
    href: 'https://data-table.pairusuo.top/',
    descriptionKey: 'dataTable',
  },
] as const

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: t('nav.tools'),
    description: t('tools.subtitle'),
    keywords: 'tools, utilities, projects, calculators, pairusuo',
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      title: `${t('nav.tools')} | ${t('meta.title')}`,
      description: t('tools.subtitle'),
      type: 'website',
      url: canonical,
      siteName: t('meta.title'),
      locale: 'en_US',
      images: [createDefaultOgImage(`${t('nav.tools')} | ${t('meta.title')}`)],
    },
    twitter: {
      card: 'summary_large_image',
      site: twitterHandle,
      title: `${t('nav.tools')} | ${t('meta.title')}`,
      description: t('tools.subtitle'),
      images: [defaultOgImage],
    },
    alternates: {
      canonical,
    },
  }
}

function getHostname(url: string) {
  return new URL(url).hostname.replace(/^www\./, '')
}

export default function ToolsPage() {
  return (
    <div className="container mx-auto max-w-5xl px-4 py-8 pb-20">
      <BreadcrumbJsonLd
        items={[
          { name: t('nav.home'), item: siteUrl },
          { name: t('nav.tools'), item: canonical },
        ]}
      />
      <CollectionPageJsonLd
        name={`${t('meta.title')} ${t('nav.tools')}`}
        url={canonical}
        description={t('tools.subtitle')}
      />

      <div className="space-y-12">
        <section className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-muted/40 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            <Wrench className="h-3.5 w-3.5" />
            <span>{t('tools.eyebrow')}</span>
          </div>
          <div className="space-y-3">
            <h1 className="text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
              {t('tools.title')}
            </h1>
            <p className="max-w-3xl text-base leading-7 text-muted-foreground">
              {t('tools.subtitle')}
            </p>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          {tools.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              target="_blank"
              rel="noopener noreferrer"
              title={tool.name}
              className="group flex h-full flex-col rounded-3xl border border-border bg-background px-5 py-5 transition-colors hover:border-amber-300/80 hover:bg-stone-50/60 dark:hover:border-amber-500/40 dark:hover:bg-stone-900"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                    {getHostname(tool.href)}
                  </p>
                  <h2 className="text-2xl font-semibold tracking-tight text-stone-900 transition-colors group-hover:text-primary dark:text-stone-100">
                    {tool.name}
                  </h2>
                </div>
                <ArrowUpRight className="h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
              </div>

              <p className="mt-4 text-sm leading-7 text-muted-foreground">
                {t(`tools.descriptions.${tool.descriptionKey}`)}
              </p>

              <div className="mt-auto pt-6 text-sm font-medium text-amber-700 transition-colors group-hover:text-amber-800 dark:text-amber-400 dark:group-hover:text-amber-300">
                {t('tools.openLink')} →
              </div>
            </Link>
          ))}
        </section>

        <section className="rounded-3xl border border-dashed border-border/80 bg-muted/25 px-6 py-6">
          <h2 className="text-xl font-semibold tracking-tight">{t('tools.moreTitle')}</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground">
            {t('tools.moreDescription')}
          </p>
        </section>
      </div>
    </div>
  )
}
