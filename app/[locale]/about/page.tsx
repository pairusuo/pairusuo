import { getTranslations } from "next-intl/server";

export default async function AboutPage() {
  const t = await getTranslations("about");
  return (
    <article className="prose dark:prose-invert">
      <h1>{t("title")}</h1>
      <p>{t("content")}</p>
    </article>
  );
}
