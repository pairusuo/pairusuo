import Link from "next/link";
import { getAllPostMeta, PostMeta } from "@/lib/posts";
import { getTranslations } from "next-intl/server";
import { formatDateTime } from "@/lib/utils";
import type { Metadata } from "next";

// Generate dynamic metadata for the blog page
export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "blog" });
  const siteT = await getTranslations({ locale, namespace: "site" });

  const title = `${t("title")} - ${siteT("title")}`;
  const description = locale === "zh"
    ? "浏览所有技术文章和出海经验分享"
    : "Browse all tech articles and sharing";
  const baseUrl = "https://pairusuo.top"; // 替换为你的实际域名
  const url = locale === "zh" ? `${baseUrl}/blog` : `${baseUrl}/${locale}/blog`;

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

// Revalidate the blog list periodically to pick up new posts without a full rebuild.
export const revalidate = 300; // seconds

export default async function BlogList({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "blog" });
  const posts: PostMeta[] = getAllPostMeta(locale as "zh" | "en");
  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
      {posts.length === 0 ? (
        <p className="text-muted-foreground">{t("empty")}</p>
      ) : (
        <ul className="space-y-4">
          {posts.map((p: PostMeta) => (
            <li key={p.slug} className="border rounded p-4 hover:bg-muted/50 overflow-hidden">
              <Link href={`/${locale}/blog/${p.slug}`} className="font-medium break-words">
                {p.title}
              </Link>
              <p className="text-xs text-muted-foreground mt-1">{formatDateTime(p.publishedAt, locale)} · {t("readingTime", { minutes: p.readingMinutes })}</p>
              {p.summary && (
                <p className="text-muted-foreground mt-2 line-clamp-2 break-words">{p.summary}</p>
              )}
              {p.tags && p.tags.length > 0 && (
                <div className="text-xs text-muted-foreground mt-2 space-x-2">
                  {p.tags.map((tag) => (
                    <span key={tag}>#{tag}</span>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
