// import { headers, cookies } from "next/headers"; // 静态导出模式不支持
// import { notFound } from "next/navigation"; // 在静态导出中改为客户端处理
import type { Metadata } from "next";
import Editor from "./editor";
import { loadNamespace } from "@/lib/messages";

// Generate static params for locale
export function generateStaticParams() {
  return [{ locale: 'zh' }, { locale: 'en' }];
}

// Prevent indexing admin page (top-level export required)
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminPage({ params, searchParams }: { params: Promise<{ locale: string }>, searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { locale } = await params;
  const q = await searchParams;
  
  // 在静态导出模式下，无法访问 headers 和 cookies
  // 改为通过客户端组件处理认证
  const fromQuery = (typeof q.token === 'string' && q.token) || (typeof q.t === 'string' && q.t) || (typeof q.admin_token === 'string' && q.admin_token) || "";
  
  const dict = await loadNamespace(locale, "admin");
  const t = (key: string) => (dict?.[key] as string) || key;

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
      <p className="text-muted-foreground text-sm">{t("tip")}</p>
      <Editor adminToken={fromQuery} initialLocale={locale || "zh"} />
    </section>
  );
}
