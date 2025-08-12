import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";

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
  const baseUrl = "https://pairusuo.top"; // 替换为你的实际域名
  const url = locale === "zh" ? `${baseUrl}/about` : `${baseUrl}/${locale}/about`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
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
