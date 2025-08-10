import { notFound } from "next/navigation";
import { getPost } from "@/lib/posts";
import { getTranslations } from "next-intl/server";
import { formatDateTime } from "@/lib/utils";

// Incremental Static Regeneration for post pages
export const revalidate = 300; // seconds


export default async function BlogDetail({
  params,
}: {
  params: Promise<{ locale: string; slug: string | string[] }>;
}) {
  const { locale, slug } = await params;
  const joinedSlug = Array.isArray(slug) ? slug.join("/") : slug;
  const post = await getPost(locale as "zh" | "en", joinedSlug);
  if (!post) return notFound();
  const t = await getTranslations({ locale, namespace: "blog" });
  return (
    <article className="prose dark:prose-invert">
      <h1>{post.meta.title}</h1>
      <p className="text-sm text-muted-foreground">
        {formatDateTime(post.meta.publishedAt, locale)} · {t("readingTime", { minutes: post.meta.readingMinutes })}
      </p>
      <div className="mt-6">{post.content}</div>
    </article>
  );
}
