// import { headers, cookies } from "next/headers"; // 静态导出模式不支持
// import { notFound } from "next/navigation"; // 在静态导出中改为客户端处理
import type { Metadata } from "next";
import Editor from "./editor";
import { loadNamespace } from "@/lib/messages";

export const dynamic = 'force-static';

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

export default async function AdminPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  
  const dict = await loadNamespace(locale, "admin");
  const t = (key: string) => (dict?.[key] as string) || key;

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
      <p className="text-muted-foreground text-sm">{t("tip")}</p>
      <Editor adminToken="" initialLocale={locale || "zh"} />
    </section>
  );
}
