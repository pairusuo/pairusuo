import { headers, cookies } from "next/headers";
import { notFound } from "next/navigation";
import Editor from "./editor";
import { loadNamespace } from "@/lib/messages";

export default async function AdminPage({ params, searchParams }: { params: Promise<{ locale: string }>, searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const h = await headers();
  const c = await cookies();
  const { locale } = await params;
  const q = await searchParams;
  // Accept token via header, query string, cookie, or Authorization: Bearer <token>
  const authHeader = h.get("authorization") || "";
  const bearer = authHeader.toLowerCase().startsWith("bearer ") ? authHeader.slice(7).trim() : "";
  const fromQuery = (typeof q.token === 'string' && q.token) || (typeof q.t === 'string' && q.t) || (typeof q.admin_token === 'string' && q.admin_token) || "";
  const fromCookie = c.get("admin-token")?.value || c.get("ADMIN_TOKEN")?.value || "";
  const reqToken = h.get("x-admin-token") || bearer || fromQuery || fromCookie || "";
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
