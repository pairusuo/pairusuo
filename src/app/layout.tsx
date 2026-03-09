import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { t } from "@/lib/i18n";
import { OrganizationJsonLd, WebSiteJsonLd } from "@/components/seo/jsonld";
import { createDefaultOgImage, defaultOgImage, siteUrl, twitterHandle } from "@/lib/seo";

const analyticsSiteId = process.env.NEXT_PUBLIC_ANALYTICS_SITE_ID;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: t("meta.title"),
    template: `%s | ${t("meta.title")}`,
  },
  description: t("meta.description"),
  keywords: t("meta.keywords"),
  authors: [{ name: t("meta.author") }],
  creator: t("meta.author"),
  publisher: t("meta.author"),
  applicationName: t("meta.title"),
  icons: {
    icon: [
      { url: "/info.png", sizes: "256x256", type: "image/png" },
      { url: "/favicon.ico", sizes: "256x256", type: "image/x-icon" },
    ],
    shortcut: "/info.png",
    apple: "/info.png",
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    title: t("meta.title"),
    description: t("meta.description"),
    siteName: t("meta.title"),
    images: [createDefaultOgImage(t("meta.title"))],
  },
  twitter: {
    card: "summary_large_image",
    site: twitterHandle,
    title: t("meta.title"),
    description: t("meta.description"),
    images: [defaultOgImage],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
    // yahoo: 'your-yahoo-verification-code',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const baseUrl = siteUrl;
  return (
    <html lang="en" suppressHydrationWarning>
      {analyticsSiteId ? (
        <Script
          src="https://analytics.pairusuo.top/api/script.js"
          data-site-id={analyticsSiteId}
          strategy="afterInteractive"
        />
      ) : null}
      <body className="font-sans">
        {/* GEO: JSON-LD for WebSite and Organization to help LLMs understand the site */}
        <WebSiteJsonLd name={t("meta.title")} url={baseUrl} />
        <OrganizationJsonLd
          name={t("meta.title")}
          url={baseUrl}
          logo={`${baseUrl}/info.png`}
          sameAs={["https://x.com/pairusuo", "https://github.com/pairusuo"]}
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* 外层背景 - 浅灰色/纯黑色 */}
          <div className="min-h-screen bg-muted">
            <Header />

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
  );
}
