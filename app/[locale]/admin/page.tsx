import { headers } from "next/headers";
import { notFound } from "next/navigation";
import Editor from "./editor";
import { loadNamespace } from "@/lib/messages";

export default async function AdminPage({ params }: { params: Promise<{ locale: string }> }) {
  const h = await headers();
  const { locale } = await params;
  const reqToken = h.get("x-admin-token") || "";
  const serverToken = process.env.ADMIN_TOKEN || "";

  if (!serverToken || reqToken !== serverToken) {
    notFound();
  }
  const dict = await loadNamespace(locale, "admin");
  const t = (key: string) => (dict?.[key] as string) || key;

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
      <p className="text-muted-foreground text-sm">{t("tip")}</p>
      <Editor adminToken={reqToken} initialLocale={locale || "zh"} />
    </section>
  );
}
