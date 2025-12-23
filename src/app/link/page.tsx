import { t } from '@/lib/i18n'
import Link from 'next/link'
import { ExternalLink } from 'lucide-react'

export async function generateMetadata() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://pairusuo.top'

  return {
    title: `${t('nav.links')} - ${t('meta.title')}`,
    description: t('links.subtitle'),
    keywords: 'Next.js,React,TypeScript,Tailwind CSS,MDX,Cloudflare,友链,技术栈',
    openGraph: {
      title: `${t('nav.links')} - ${t('meta.title')}`,
      description: t('links.subtitle'),
      type: 'website',
      url: `${baseUrl}/link`,
    },
    twitter: {
      card: 'summary',
      title: `${t('nav.links')} - ${t('meta.title')}`,
      description: t('links.subtitle'),
    },
    alternates: {
      canonical: `${baseUrl}/link`,
    },
  }
}

// 工具分享链接数据
const toolSharingLinks = [
  {
    name: 'Hostinger VPS',
    url: 'https://hostinger.com?REFERRALCODE=pairusuo',
    descriptionKey: 'hostinger',
    category: 'server'
  },
]

// 技术栈链接数据
const techStackLinks = [
  {
    name: 'Next.js',
    url: 'https://nextjs.org',
    descriptionKey: 'nextjs',
    category: 'framework'
  },
  {
    name: 'React',
    url: 'https://react.dev',
    descriptionKey: 'react',
    category: 'framework'
  },
  {
    name: 'TypeScript',
    url: 'https://www.typescriptlang.org',
    descriptionKey: 'typescript',
    category: 'language'
  },
  {
    name: 'Tailwind CSS',
    url: 'https://tailwindcss.com/plus',
    descriptionKey: 'tailwind',
    category: 'styling'
  },
  {
    name: 'Shadcn/ui',
    url: 'https://ui.shadcn.com',
    descriptionKey: 'shadcn',
    category: 'ui'
  },
  {
    name: 'MDX',
    url: 'https://mdxjs.com',
    descriptionKey: 'mdx',
    category: 'content'
  },
  {
    name: 'Cloudflare',
    url: 'https://cloudflare.com',
    descriptionKey: 'cloudflare',
    category: 'hosting'
  },
  {
    name: 'Vercel',
    url: 'https://vercel.com',
    descriptionKey: 'vercel',
    category: 'hosting'
  },
  {
    name: 'pnpm',
    url: 'https://pnpm.io',
    descriptionKey: 'pnpm',
    category: 'tool'
  }
]

// 推荐链接数据
const recommendedLinks = [
  {
    name: 'GitHub',
    url: 'https://github.com',
    descriptionKey: 'github',
    category: 'development'
  },
  {
    name: 'MDN Web Docs',
    url: 'https://developer.mozilla.org',
    descriptionKey: 'mdn',
    category: 'documentation'
  },
  {
    name: 'Can I Use',
    url: 'https://caniuse.com',
    descriptionKey: 'caniuse',
    category: 'tool'
  },
  {
    name: 'Unsplash',
    url: 'https://unsplash.com',
    descriptionKey: 'unsplash',
    category: 'resource'
  },
  {
    name: 'Tailwind Color',
    url: 'https://tailwindcolor.com',
    descriptionKey: 'tailwindcolor',
    category: 'tool'
  },
  {
    name: 'Whoiscx',
    url: 'https://whoiscx.com',
    descriptionKey: 'whoiscx',
    category: 'tool'
  },
  {
    name: 'A Real Me',
    url: 'https://www.arealme.com',
    descriptionKey: 'arealme',
    category: 'tool'
  },
]

function LinkCard({ name, url, descriptionKey, category }: {
  name: string
  url: string
  descriptionKey: string
  category: string
}) {
  return (
    <Link
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="block p-4 border rounded-lg hover:shadow-md transition-all duration-200 hover:border-primary/50 group"
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <div className="flex items-center space-x-2">
            <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
              {name}
            </h3>
            <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {t(`links.descriptions.${descriptionKey}`)}
          </p>
          <span className="inline-block px-2 py-1 text-xs bg-muted rounded-md text-muted-foreground">
            {t(`links.categories.${category}`)}
          </span>
        </div>
      </div>
    </Link>
  )
}

export default function LinksPage() {
  return (
    <div className="container mx-auto max-w-6xl px-4 py-4 sm:px-6 sm:py-6 md:py-8">
      <div className="bg-content-background rounded-xl shadow-sm border p-4 sm:p-6 md:p-8">
        <div className="space-y-8">

          {/* 工具分享 */}
          <section>
            <h2 className="text-2xl font-semibold mb-6">{t('links.toolSharing')}</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {toolSharingLinks.map((link) => (
                <LinkCard
                  key={link.name}
                  name={link.name}
                  url={link.url}
                  descriptionKey={link.descriptionKey}
                  category={link.category}
                />
              ))}
            </div>
          </section>

          {/* 技术栈 */}
          <section>
            <h2 className="text-2xl font-semibold mb-6">{t('links.techStack')}</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {techStackLinks.map((link) => (
                <LinkCard
                  key={link.name}
                  name={link.name}
                  url={link.url}
                  descriptionKey={link.descriptionKey}
                  category={link.category}
                />
              ))}
            </div>
          </section>

          {/* 推荐链接 */}
          <section>
            <h2 className="text-2xl font-semibold mb-6">{t('links.recommended')}</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {recommendedLinks.map((link) => (
                <LinkCard
                  key={link.name}
                  name={link.name}
                  url={link.url}
                  descriptionKey={link.descriptionKey}
                  category={link.category}
                />
              ))}
            </div>
          </section>

          {/* 说明 */}
          <section className="mt-8">
            <div className="p-6 border rounded-lg bg-muted/50">
              <h3 className="font-semibold mb-3">{t('links.aboutLinks')}</h3>
              <p className="text-muted-foreground leading-7 text-sm">
                {t('links.aboutLinksDesc')}
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}