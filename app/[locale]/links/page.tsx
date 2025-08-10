import rawLinks from "@/content/links.json";
import { useTranslations } from "next-intl";

type LinkItem = { url: string; name: string; desc?: string };
const links = rawLinks as LinkItem[];

export default function LinksPage() {
  const t = useTranslations("links");
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
      {links.length === 0 ? (
        <p className="text-muted-foreground">{t("empty")}</p>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {links.map((l) => (
            <li key={l.url} className="border rounded p-4 hover:bg-muted/50 break-words">
              <a href={l.url} target="_blank" rel="noreferrer" className="font-medium">
                {l.name}
              </a>
              {l.desc && <p className="text-sm text-muted-foreground mt-1">{l.desc}</p>}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
