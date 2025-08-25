import rawLinks from "@/content/links.json";
import { getTranslations } from "next-intl/server";
import { getBaseUrl } from "@/lib/site";
import type { Metadata } from "next";

type LinkItem = { url: string; name: string; desc?: string };
const links = rawLinks as LinkItem[];

// Generate static params for locale
export function generateStaticParams() {
  return [{ locale: 'zh' }, { locale: 'en' }];
}

// Generate dynamic metadata for the links page
export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "links" });
  const siteT = await getTranslations({ locale, namespace: "site" });

  const title = `${t("title")} - ${siteT("title")}`;
  const description =
    locale === "zh"
      ? "友情链接和推荐资源"
      : "Friend links and recommended resources";
  const baseUrl = getBaseUrl();
  const url =
    locale === "zh" ? `${baseUrl}/links` : `${baseUrl}/${locale}/links`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: {
        'zh': `${baseUrl}/links`,
        'en': `${baseUrl}/en/links`,
      },
    },
    openGraph: {
      title,
      description,
      url,
      type: "website"
    }
  };
}

export default async function LinksPage({
  params
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "links" });
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
      {links.length === 0 ? (
        <p className="text-muted-foreground">{t("empty")}</p>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {links.map((l) => (
            <li
              key={l.url}
              className="border rounded p-4 hover:bg-muted/50 break-words"
            >
              <a
                href={l.url}
                target="_blank"
                rel="noreferrer"
                className="font-medium"
              >
                {l.name}
              </a>
              {l.desc && (
                <p className="text-sm text-muted-foreground mt-1">
                  {l.desc}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
