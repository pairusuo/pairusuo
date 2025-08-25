import Link from "next/link";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { getBaseUrl } from "@/lib/site";
import { loadBase } from "@/lib/messages";
import { getAllPostMeta, PostMeta } from "@/lib/posts";
import { formatDateTime } from "@/lib/utils";
import { PersonalTag } from "@/components/ui/personal-tag";
import type { Metadata } from "next";

type PersonalTagType = {
  text: string;
  url?: string;
  color?: string;
  tooltip?: string;
};

// Generate static params for locale
export function generateStaticParams() {
  return [{ locale: 'zh' }, { locale: 'en' }];
}

// Generate dynamic metadata for the home page
export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ locale: string }> 
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "site" });
  const homeT = await getTranslations({ locale, namespace: "home" });
  
  const title = t("title");
  const description = homeT("subtitle");
  const baseUrl = getBaseUrl();
  const url = locale === "zh" ? `${baseUrl}/` : `${baseUrl}/${locale}`;
  
  return {
    title,
    description,
    keywords: locale === "zh" 
      ? "pairusuo, 个人博客, 出海, 技术分享, Next.js, React"
      : "pairusuo, personal blog, tech, Next.js, React",
    authors: [{ name: "pairusuo" }],
    creator: "pairusuo",
    publisher: "pairusuo",
    alternates: {
      canonical: url,
      languages: {
        'zh': baseUrl,
        'en': `${baseUrl}/en`,
      },
    },
    openGraph: {
      title,
      description,
      url,
      siteName: title,
      locale: locale === "zh" ? "zh_CN" : "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      creator: "@pairusuo", // 替换为你的 Twitter 用户名
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
  };
}

// Revalidate the home list periodically to pick up new posts without a full rebuild.
export const revalidate = 300; // seconds

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home" });
  const base = await loadBase(locale);
  const homeData = base.home as { tags?: string[] } | undefined;
  const tags: string[] = Array.isArray(homeData?.tags) ? homeData.tags : [];
  const postsAll: PostMeta[] = await getAllPostMeta(locale as "zh" | "en");
  const posts: PostMeta[] = postsAll.slice(0, 10);
  
  // Get personal tags from translations
  const personalInfo = t.raw("personalInfo") as { 
    name: string; 
    title: string; 
    description: string; 
    specialTags?: PersonalTagType[] 
  };
  const specialTags: PersonalTagType[] = Array.isArray(personalInfo?.specialTags) 
    ? personalInfo.specialTags 
    : [];
  
  // Combine regular tags with special tags
  const allTags = [
    ...tags.map(tag => ({ text: tag, color: "default" })),
    ...specialTags
  ];

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">{t("welcome")}</h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main: recent posts */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">{t("recent")}</h2>
            <Link href={`/${locale}/blog`} className="text-sm text-primary hover:underline">{t("more")}</Link>
          </div>
          {posts.length === 0 ? (
            <p className="text-muted-foreground">{t("empty")}</p>
          ) : (
            <ul className="space-y-4">
              {posts.map((p) => (
                <li key={p.slug} className="border rounded-lg p-4 hover-lift card-glow animate-border overflow-hidden">
                  <Link
                    href={`/${locale}/blog/${p.slug}`}
                    className="font-medium break-words inline-block outline-none rounded-sm enhanced-link focus-visible:ring-2 focus-visible:ring-primary/40"
                  >
                    {p.title}
                  </Link>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDateTime(p.publishedAt, locale)} · {t("readingTime", { minutes: p.readingMinutes })}
                  </p>
                  {p.summary && (
                    <p className="text-muted-foreground mt-2 line-clamp-2 break-words">{p.summary}</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Sidebar: personal info and other content */}
        <aside className="space-y-4">
          {/* Personal Info Card */}
          <div className="border rounded-lg p-4 space-y-3 card-glow hover-lift">
            <div className="flex items-center gap-3">
              <div className="relative w-16 h-16 rounded-full overflow-hidden bg-muted shrink-0 pulse-glow">
                <Image
                  src="/info.png"
                  alt="pairusuo"
                  width={64}
                  height={64}
                  className="object-cover object-center w-full h-full"
                  priority
                  sizes="64px"
                />
              </div>
              <div className="min-w-0">
                <h3 className="font-medium gradient-text">{t("personalInfo.name")}</h3>
                <p className="text-sm text-muted-foreground">{t("personalInfo.title")}</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t("personalInfo.description")}
            </p>
          </div>
          
          {/* Tags */}
          <div className="border rounded-lg p-4 card-glow hover-lift">
            <div className="text-sm font-medium mb-2">{t("tagsTitle")}</div>
            {allTags.length === 0 ? (
              <p className="text-sm text-muted-foreground">—</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {allTags.map((tag, index) => (
                  <PersonalTag key={index} tag={tag} index={index} />
                ))}
              </div>
            )}
          </div>

          {/* WeChat Official Account */}
          <div className="border rounded-lg p-4 card-glow hover-lift">
            <div className="text-sm font-medium mb-3 text-center">{t("personalInfo.qrcode.label")}</div>
            <div className="flex items-center justify-center">
              <div className="relative w-24 h-24 border rounded-lg overflow-hidden bg-white hover-lift">
                <Image
                  src="/qrcode.jpg"
                  alt={t("personalInfo.qrcode.alt")}
                  width={96}
                  height={96}
                  className="object-contain w-full h-full"
                  sizes="96px"
                />
              </div>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
