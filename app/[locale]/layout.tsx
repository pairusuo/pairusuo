import type { Metadata } from "next";
import { getLogoSvgString } from "@/components/logo";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n";
import { getTranslations } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import { loadBase, loadNamespace } from "@/lib/messages";
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

  // Provide messages for client components using next-intl (e.g., admin editor)
  const baseMessages = await loadBase(locale);
  const adminMessages = await loadNamespace(locale, "admin");
  const messages = { ...baseMessages, admin: adminMessages } as any;

  return (
    <NextIntlClientProvider locale={locale} messages={messages} timeZone={"Asia/Shanghai"}>
      <div className="min-h-dvh flex flex-col">
        <Header locale={locale} translations={headerTranslations} />
        <main className="site-container flex-1 py-8">{children}</main>
        <Footer />
      </div>
    </NextIntlClientProvider>
  );
}

