import { NextIntlClientProvider } from 'next-intl';
import { loadBase, loadNamespace } from '@/lib/messages';
import Header from '@/components/header';
import Footer from '@/components/footer';
import HomePageContent from '@/app/[locale]/page';
import { getTranslations } from 'next-intl/server';
import './globals.css';

export const dynamic = 'force-static';

// Root page that renders Chinese content directly
export default async function RootPage() {
  const locale = 'zh';
  
  // Load translations server-side
  const headerT = await getTranslations({ locale, namespace: "header" });
  const headerTranslations = {
    home: headerT("home"),
    blog: headerT("blog"),
    links: headerT("links"),
    about: headerT("about"),
  };

  // Provide messages for client components
  const baseMessages = await loadBase(locale);
  const adminMessages = await loadNamespace(locale, "admin");
  const messages = { ...baseMessages, admin: adminMessages } as any;

  return (
    <NextIntlClientProvider locale={locale} messages={messages} timeZone={"Asia/Shanghai"}>
      <div className="min-h-dvh flex flex-col">
        <Header locale={locale} translations={headerTranslations} />
        <main className="site-container flex-1 py-8">
          <HomePageContent params={Promise.resolve({ locale })} />
        </main>
        <Footer />
      </div>
    </NextIntlClientProvider>
  );
}

// Generate metadata for the root page
export async function generateMetadata() {
  const t = await getTranslations({ locale: 'zh', namespace: "site" });
  const homeT = await getTranslations({ locale: 'zh', namespace: "home" });
  
  return {
    title: t("title"),
    description: homeT("subtitle"),
  };
}