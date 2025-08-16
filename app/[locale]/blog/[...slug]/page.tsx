import { notFound } from "next/navigation";
import { getPost, getAllPostMeta, hasPost } from "@/lib/posts";
import { getTranslations } from "next-intl/server";
import { formatDateTime } from "@/lib/utils";
import type { Metadata } from "next";
import { getBaseUrl, absoluteUrl } from "@/lib/site";

export const revalidate = 300;

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
  const baseUrl = getBaseUrl();
  const url = locale === "zh" 
    ? `${baseUrl}/blog/${joinedSlug}` 
    : `${baseUrl}/${locale}/blog/${joinedSlug}`;
  // Check alt language counterpart for hreflang without reading files
  const altLocale = (locale === 'zh' ? 'en' : 'zh') as 'zh' | 'en';
  const altExists = await hasPost(altLocale, joinedSlug);
  const languages = altExists
    ? { zh: `${baseUrl}/blog/${joinedSlug}`, en: `${baseUrl}/en/blog/${joinedSlug}` }
    : (locale === 'zh'
        ? { zh: `${baseUrl}/blog/${joinedSlug}` }
        : { en: `${baseUrl}/en/blog/${joinedSlug}` });
  
  return {
    title,
    description,
    keywords: post.meta.tags ? post.meta.tags.join(", ") : undefined,
    authors: [{ name: "pairusuo" }],
    alternates: {
      canonical: url,
      languages,
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
  const base = getBaseUrl();
  const pageUrl = locale === "zh" ? `${base}/blog/${joinedSlug}` : `${base}/${locale}/blog/${joinedSlug}`;

  // JSON-LD: BlogPosting
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.meta.title,
    description: post.meta.summary || post.meta.title,
    datePublished: post.meta.publishedAt || undefined,
    dateModified: post.meta.updatedAt || post.meta.publishedAt || undefined,
    author: { "@type": "Person", name: "pairusuo" },
    publisher: {
      "@type": "Organization",
      name: "pairusuo",
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": pageUrl,
    },
    url: pageUrl,
    inLanguage: locale === "zh" ? "zh-CN" : "en-US",
    image: post.meta.cover ? [absoluteUrl(post.meta.cover)] : undefined,
    wordCount: post.meta.readingMinutes ? post.meta.readingMinutes * 200 : undefined,
    keywords: post.meta.tags && post.meta.tags.length ? post.meta.tags.join(",") : undefined,
  } as const;

  // JSON-LD: BreadcrumbList
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: locale === "zh" ? "首页" : "Home",
        item: locale === "zh" ? `${base}/` : `${base}/en`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: locale === "zh" ? "博客" : "Blog",
        item: locale === "zh" ? `${base}/blog` : `${base}/en/blog`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: post.meta.title,
        item: pageUrl,
      },
    ],
  } as const;
  return (
    <article className="prose dark:prose-invert">
      {/* JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <h1>{post.meta.title}</h1>
      <p className="text-sm text-muted-foreground">
        {formatDateTime(post.meta.publishedAt, locale)} · {t("readingTime", { minutes: post.meta.readingMinutes })}
      </p>
      <div className="mt-6">{post.content}</div>
    </article>
  );
}
