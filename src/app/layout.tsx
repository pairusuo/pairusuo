import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/layout/theme-provider'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { t } from '@/lib/i18n'
import { OrganizationJsonLd, WebSiteJsonLd } from '@/components/seo/jsonld'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: t('meta.title'),
  description: t('meta.description'),
  keywords: t('meta.keywords'),
  authors: [{ name: t('meta.author') }],
  creator: t('meta.author'),
  publisher: t('meta.author'),
  icons: {
    icon: [
      { url: '/info.png', sizes: '256x256', type: 'image/png' },
      { url: '/favicon.ico', sizes: '256x256', type: 'image/x-icon' }
    ],
    shortcut: '/info.png',
    apple: '/info.png',
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: process.env.NEXT_PUBLIC_SITE_URL || 'https://pairusuo.top',
  },
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://pairusuo.top',
    title: t('meta.title'),
    description: t('meta.description'),
    siteName: t('meta.title'),
  },
  twitter: {
    card: 'summary_large_image',
    title: t('meta.title'),
    description: t('meta.description'),
    creator: '@yourusername',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
    // yahoo: 'your-yahoo-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://pairusuo.top'
  return (
    <html lang="zh" suppressHydrationWarning>
      <body className={inter.className}>
        {/* GEO: JSON-LD for WebSite and Organization to help LLMs understand the site */}
        <WebSiteJsonLd name={t('meta.title')} url={baseUrl} />
        <OrganizationJsonLd
          name={t('meta.title')}
          url={baseUrl}
          logo={`${baseUrl}/info.png`}
          sameAs={[
            'https://x.com/pairusuo',
            'https://github.com/pairusuo',
          ]}
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* 外层背景 - 浅灰色/纯黑色 */}
          <div className="min-h-screen bg-muted">
            {/* 固定Header */}
            <div className="fixed top-0 left-0 right-0 z-50 bg-muted">
              <div className="max-w-7xl mx-auto bg-background">
                <Header />
              </div>
            </div>
            
            {/* 中间内容区域 - 纯白色/深灰色背景 */}
            <div className="max-w-7xl mx-auto bg-background min-h-screen pt-20 flex flex-col">
              <main className="flex-1 px-4 py-4 sm:px-6 sm:py-6">
                {children}
              </main>
              
              {/* Footer - 跟随内容流动 */}
              <div>
                <Footer />
              </div>
            </div>
            
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
