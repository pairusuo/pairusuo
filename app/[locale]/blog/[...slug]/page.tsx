import { notFound } from "next/navigation";
import { getPost, getAllPostMeta } from "@/lib/posts";
import { getTranslations } from "next-intl/server";
import { formatDateTime } from "@/lib/utils";
import type { Metadata } from "next";

export const dynamic = 'force-dynamic';

// Generate static params for all posts
export async function generateStaticParams() {
  const locales = ["zh", "en"];
  const allParams: { locale: string; slug: string[] }[] = [];
  
  for (const locale of locales) {
    const posts = await getAllPostMeta(locale as "zh" | "en");
    const params = posts.map((post) => ({
      locale,
      slug: post.slug.split("/"),
    }));
    allParams.push(...params);
  }
  
  return allParams;
}

// Generate dynamic metadata for blog posts
export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ locale: string; slug: string | string[] }> 
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const joinedSlug = Array.isArray(slug) ? slug.join("/") : slug;
  const post = await getPost(locale as "zh" | "en", joinedSlug);
  
  if (!post) {
    return {
      title: "文章未找到",
      description: "请求的文章不存在",
    };
  }
  
  const siteT = await getTranslations({ locale, namespace: "site" });
  const title = `${post.meta.title} - ${siteT("title")}`;
  const description = post.meta.summary || post.meta.title;
  const baseUrl = "https://pairusuo.top"; // 替换为你的实际域名
  const url = locale === "zh" 
    ? `${baseUrl}/blog/${joinedSlug}` 
    : `${baseUrl}/${locale}/blog/${joinedSlug}`;
  
  return {
    title,
    description,
    keywords: post.meta.tags ? post.meta.tags.join(", ") : undefined,
    authors: [{ name: "pairusuo" }],
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: post.meta.title,
      description,
      url,
      type: "article",
      publishedTime: post.meta.publishedAt,
      authors: ["pairusuo"],
      tags: post.meta.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: post.meta.title,
      description,
    },
  };
}


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
