import type { Metadata } from "next";
import { getLogoSvgString } from "@/components/logo";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n";
import { getTranslations } from "next-intl/server";
import Header from "@/components/header";
import Footer from "@/components/footer";
import "../globals.css";

const svgIcon = encodeURIComponent(getLogoSvgString());
const dataUrl = `data:image/svg+xml;utf8,${svgIcon}`;

// Base metadata for layout, individual pages can override
export const metadata: Metadata = {
  icons: {
    icon: dataUrl,
    shortcut: dataUrl,
    apple: dataUrl,
  },
};

export default async function LocaleLayout({
  params,
  children,
}: {
  params: Promise<{ locale: string }>;
  children: React.ReactNode;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  // Load translations server-side
  const headerT = await getTranslations({ locale, namespace: "header" });
  const headerTranslations = {
    home: headerT("home"),
    blog: headerT("blog"),
    links: headerT("links"),
    about: headerT("about"),
  };

  return (
    <html lang={locale}>
      <body className="inter_5802845b-module__9kuUBG__variable noto_sans_sc_363aa9d0-module__fF6goG__variable antialiased">
        <div className="min-h-dvh flex flex-col">
          <Header locale={locale} translations={headerTranslations} />
          <main className="site-container flex-1 py-8">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
