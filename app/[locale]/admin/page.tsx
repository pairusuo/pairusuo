import { headers } from "next/headers";
import { notFound } from "next/navigation";
import Editor from "./editor";

export default async function AdminPage({ params }: { params: Promise<{ locale: string }> }) {
  const h = await headers();
  const { locale } = await params;
  const reqToken = h.get("x-admin-token") || "";
  const serverToken = process.env.ADMIN_TOKEN || "";

  if (!serverToken || reqToken !== serverToken) {
    notFound();
  }

  const dict = (await (locale === "en"
    ? import("@/messages/en/admin.json")
    : import("@/messages/zh/admin.json"))).default as Record<string, string>;

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">{dict.title}</h1>
      <p className="text-muted-foreground text-sm">{dict.tip}</p>
      <Editor adminToken={reqToken} initialLocale={locale || "zh"} />
    </section>
  );
}
