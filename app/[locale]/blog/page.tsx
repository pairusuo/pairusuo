import Link from "next/link";
import { getAllPosts } from "@/lib/posts";

export default async function BlogList({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const posts = await getAllPosts(locale as "zh" | "en");
  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Blog</h1>
      {posts.length === 0 ? (
        <p className="text-muted-foreground">No posts yet.</p>
      ) : (
        <ul className="space-y-4">
          {posts.map((p) => (
            <li key={p.meta.slug} className="border rounded p-4 hover:bg-muted/50 overflow-hidden">
              <Link href={`/${locale}/blog/${p.meta.slug}`} className="font-medium break-words">
                {p.meta.title}
              </Link>
              {p.meta.summary && (
                <p className="text-sm text-muted-foreground mt-1 truncate">
                  {p.meta.summary}
                </p>
              )}
              <div className="text-xs text-muted-foreground mt-2 flex gap-3 break-words">
                {p.meta.publishedAt && <span>{p.meta.publishedAt}</span>}
                <span>{p.meta.readingTime}</span>
                {p.meta.tags && p.meta.tags.length > 0 && (
                  <span>#{p.meta.tags.join(" #")}</span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
