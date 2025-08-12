import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { loadBase } from "@/lib/messages";
import { getAllPostMeta, PostMeta } from "@/lib/posts";
import { formatDateTime } from "@/lib/utils";

// Revalidate the home list periodically to pick up new posts without a full rebuild.
export const revalidate = 300; // seconds

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home" });
  const base = await loadBase(locale);
  const tags: string[] = Array.isArray(base?.home?.tags) ? (base.home.tags as string[]) : [];
  const posts: PostMeta[] = getAllPostMeta(locale as "zh" | "en").slice(0, 10);

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
                <li key={p.slug} className="border rounded p-4 hover:bg-muted/50 overflow-hidden">
                  <Link href={`/${locale}/blog/${p.slug}`} className="font-medium break-words">
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

        {/* Sidebar: reserved for other content */}
        <aside className="space-y-4">
          <div className="border rounded p-4 min-h-[160px] flex items-center justify-center text-muted-foreground">
            {t("other")}
          </div>
          <div className="border rounded p-4">
            <div className="text-sm font-medium mb-2">{t("tagsTitle")}</div>
            {tags.length === 0 ? (
              <p className="text-sm text-muted-foreground">—</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span key={tag} className="px-2 py-0.5 text-xs rounded-full border bg-muted">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </aside>
      </div>
    </section>
  );
}
