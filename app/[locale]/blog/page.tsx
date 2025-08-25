import Link from "next/link";
import { getAllPostMeta, PostMeta } from "@/lib/posts";
import { getTranslations } from "next-intl/server";
import { getBaseUrl } from "@/lib/site";
import { formatDateTime } from "@/lib/utils";
import type { Metadata } from "next";

export const revalidate = 300; // ISR for blog list page

// Generate static params for locale
export function generateStaticParams() {
  return [{ locale: 'zh' }, { locale: 'en' }];
}

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
  const baseUrl = getBaseUrl();
  const url = locale === "zh" ? `${baseUrl}/blog` : `${baseUrl}/${locale}/blog`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: {
        'zh': `${baseUrl}/blog`,
        'en': `${baseUrl}/en/blog`,
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

export default async function BlogList({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "blog" });
  const sp = await (searchParams ?? Promise.resolve({} as Record<string, string | string[] | undefined>));
  const pageRaw = sp["page"];
  const pageParam = Array.isArray(pageRaw) ? pageRaw[0] : pageRaw;
  const pageSize = 10;
  const page = Math.max(1, parseInt(String(pageParam || '1'), 10) || 1);

  const all: PostMeta[] = await getAllPostMeta(locale as "zh" | "en");
  const total = all.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize;
  const end = Math.min(start + pageSize, total);
  const posts = all.slice(start, end);

  const basePath = `/${locale}/blog`;
  const prevHref = page > 2 ? `${basePath}?page=${page - 1}` : page === 2 ? basePath : undefined;
  const nextHref = page < totalPages ? `${basePath}?page=${page + 1}` : undefined;

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
      {posts.length === 0 ? (
        <p className="text-muted-foreground">{t("empty")}</p>
      ) : (
        <>
          <ul className="space-y-4">
            {posts.map((p: PostMeta) => (
              <li key={p.slug} className="border rounded p-4 hover:bg-muted/50 overflow-hidden">
                <Link
                  href={locale === 'zh' ? `/blog/${p.slug}` : `/${locale}/blog/${p.slug}`}
                  className="font-medium break-words inline-block outline-none rounded-sm underline-offset-4 transition-[text-decoration-color,text-decoration-thickness,color] duration-150 hover:underline hover:decoration-1 focus-visible:underline focus-visible:decoration-1 focus-visible:ring-2 focus-visible:ring-primary/40"
                >
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

          {/* Pagination */}
          {(totalPages > 1) && (
            <div className="flex items-center justify-between pt-2">
              <div className="text-sm text-muted-foreground">{start + 1}-{end} / {total}</div>
              <div className="flex items-center gap-2">
                {prevHref ? (
                  <Link href={prevHref} className="px-3 h-9 rounded border hover:bg-muted/50">‹</Link>
                ) : (
                  <button className="px-3 h-9 rounded border opacity-50 cursor-not-allowed" disabled>‹</button>
                )}
                <span className="text-sm">{page} / {totalPages}</span>
                {nextHref ? (
                  <Link href={nextHref} className="px-3 h-9 rounded border hover:bg-muted/50">›</Link>
                ) : (
                  <button className="px-3 h-9 rounded border opacity-50 cursor-not-allowed" disabled>›</button>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}
