import { t } from '@/lib/i18n'
import Link from 'next/link'
import { ExternalLink } from 'lucide-react'

export async function generateMetadata() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://pairusuo.top'

  return {
    title: `${t('nav.links')} - ${t('meta.title')}`,
    description: t('links.subtitle'),
    keywords: '',
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
  {
    name: 'ZPCloud',
    url: 'https://www.zpcloud01.site/auth/register?code=YF9j',
    descriptionKey: 'zpcloud',
    category: 'vpn'
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
      className="group block"
    >
      <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
              {name}
            </h3>
            <ExternalLink className="w-3.5 h-3.5 text-muted-foreground/50 group-hover:text-primary transition-colors opacity-0 group-hover:opacity-100" />
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
            {t(`links.descriptions.${descriptionKey}`)}
          </p>
      </div>
    </Link>
  )
}

export default function LinksPage() {
  return (
    <div className="container mx-auto max-w-5xl px-4 py-8 pb-20">
      <div className="space-y-12">
        {/* Header */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">{t('links.title')}</h1>
          <p className="text-xl text-muted-foreground">
             {t('links.subtitle')}
          </p>
        </div>

        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
            {/* 工具分享 */}
            <section className="space-y-6">
                <h2 className="text-xl font-semibold border-b pb-2">{t('links.toolSharing')}</h2>
                <div className="space-y-6">
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
            <section className="space-y-6">
                <h2 className="text-xl font-semibold border-b pb-2">{t('links.techStack')}</h2>
                 <div className="space-y-6">
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
            <section className="space-y-6">
                <h2 className="text-xl font-semibold border-b pb-2">{t('links.recommended')}</h2>
                 <div className="space-y-6">
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
        </div>

          {/* 说明 */}
          <section className="pt-8 border-t">
              <h3 className="font-semibold mb-2">{t('links.aboutLinks')}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-2xl">
                {t('links.aboutLinksDesc')}
              </p>
          </section>
      </div>
    </div>
  )
}