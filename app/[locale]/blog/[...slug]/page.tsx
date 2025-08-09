import { notFound } from "next/navigation";
import { getPost } from "@/lib/posts";

export default async function BlogDetail({
  params,
}: {
  params: Promise<{ locale: string; slug: string | string[] }>;
}) {
  const { locale, slug } = await params;
  const joinedSlug = Array.isArray(slug) ? slug.join("/") : slug;
  const post = await getPost(locale as "zh" | "en", joinedSlug);
  if (!post) return notFound();
  return (
    <article className="prose dark:prose-invert">
      <h1>{post.meta.title}</h1>
      <p className="text-sm text-muted-foreground">
        {post.meta.publishedAt} · {post.meta.readingTime}
      </p>
      <div className="mt-6">{post.content}</div>
    </article>
  );
}
