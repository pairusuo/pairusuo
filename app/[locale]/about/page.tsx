import { getTranslations } from "next-intl/server";
import { getBaseUrl } from "@/lib/site";
import type { Metadata } from "next";

// Generate static params for locale
export function generateStaticParams() {
  return [{ locale: 'zh' }, { locale: 'en' }];
}

// Generate dynamic metadata for the about page
export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });
  const siteT = await getTranslations({ locale, namespace: "site" });

  const title = `${t("title")} - ${siteT("title")}`;
  const description = t("content");
  const baseUrl = getBaseUrl();
  const url = locale === "zh" ? `${baseUrl}/about` : `${baseUrl}/${locale}/about`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: {
        'zh': `${baseUrl}/about`,
        'en': `${baseUrl}/en/about`,
      },
    },
    openGraph: {
      title,
      description,
      url,
      type: "website",
    },
  };
}

export default async function AboutPage({
  params
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });
  return (
    <article className="prose dark:prose-invert">
      <h1>{t("title")}</h1>
      <p>{t("content")}</p>
    </article>
  );
}
