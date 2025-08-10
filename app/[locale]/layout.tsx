import type { Metadata } from "next";
import { getLogoSvgString } from "@/components/logo";
import { NextIntlClientProvider } from "next-intl";
import { notFound } from "next/navigation";
import { isLocale, Locale } from "@/lib/i18n";
import baseZh from "@/messages/zh.json";
import baseEn from "@/messages/en.json";
import adminZh from "@/messages/zh/admin.json";
import adminEn from "@/messages/en/admin.json";
import headerZh from "@/messages/zh/header.json";
import headerEn from "@/messages/en/header.json";
import footerZh from "@/messages/zh/footer.json";
import footerEn from "@/messages/en/footer.json";
import Header from "@/components/header";
import Footer from "@/components/footer";
import "../globals.css";

const svgIcon = encodeURIComponent(getLogoSvgString());
const dataUrl = `data:image/svg+xml;utf8,${svgIcon}`;

export const metadata: Metadata = {
  title: "pairusuo",
  description: "Personal blog",
  icons: {
    icon: dataUrl,
    shortcut: dataUrl,
    apple: dataUrl,
  },
};

function getMessages(locale: Locale) {
  switch (locale) {
    case "zh":
      return { ...baseZh, admin: adminZh, header: headerZh, footer: footerZh } as any;
    case "en":
      return { ...baseEn, admin: adminEn, header: headerEn, footer: footerEn } as any;
    default:
      return { ...baseZh, admin: adminZh, header: headerZh, footer: footerZh } as any;
  }
}

export default async function LocaleLayout({
  params,
  children,
}: {
  params: Promise<{ locale: string }>;
  children: React.ReactNode;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return (
    <NextIntlClientProvider locale={locale} messages={getMessages(locale)}>
      <div className="min-h-dvh flex flex-col">
        <Header locale={locale} />
        <main className="site-container flex-1 py-8">{children}</main>
        <Footer locale={locale} />
      </div>
    </NextIntlClientProvider>
  );
}
