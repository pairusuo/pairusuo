import type { Metadata } from "next";
import Link from "next/link";
import { CollectionPageJsonLd, BreadcrumbJsonLd } from "@/components/seo/jsonld";
import { createDefaultOgImage, gamesOgImage, siteUrl, twitterHandle } from "@/lib/seo";

const canonical = `${siteUrl}/games`;
const title = "Games | OVO Games | Online Browser Games";
const description =
  "OVO Games is a collection of classic online mini games you can play instantly in the browser, including 2048 and Minesweeper.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [],
  alternates: {
    canonical,
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    url: canonical,
    title: `${title} | pairusuo`,
    description,
    siteName: "pairusuo",
    locale: "en_US",
    images: [createDefaultOgImage("Games | pairusuo", gamesOgImage)],
  },
  twitter: {
    card: "summary_large_image",
    site: twitterHandle,
    title: `${title} | pairusuo`,
    description,
    images: [gamesOgImage],
  },
};

const games = [
  {
    title: "2048",
    href: "/games/2048",
    badge: "Live",
    meta: ["4×4 to 9×9", "Auto Play", "Keyboard + Touch"],
  },
  {
    title: "Minesweeper",
    href: "/games/minesweeper",
    badge: "New",
    meta: ["Custom Uploads", "Touch + Right Click", "Classic Rules"],
  },
];

export default function GamesPage() {
  return (
    <div className="container mx-auto max-w-5xl px-4 py-8 pb-20">
      <BreadcrumbJsonLd
        items={[
          { name: "Home", item: "https://pairusuo.top" },
          { name: "Games", item: canonical },
        ]}
      />
      <CollectionPageJsonLd
        name="OVO Games"
        url={canonical}
        description={description}
      />
      <div className="space-y-12">
        <section className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-700 dark:text-amber-400">
            OVO Games
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100">Games</h1>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {games.map((game) => (
            <Link
              key={game.href}
              href={game.href}
              title={game.title}
              className="group block rounded-2xl border border-border px-5 py-5 transition-colors hover:border-amber-300/80 hover:bg-stone-50/60 dark:hover:border-amber-500/40 dark:hover:bg-stone-900"
            >
              <div className="flex h-full flex-col gap-4">
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight text-stone-900 transition-colors group-hover:text-primary dark:text-stone-100">
                    {game.title}
                  </h2>
                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
                    <span>{game.badge}</span>
                    {game.meta.map((item) => (
                      <span key={item}>{item}</span>
                    ))}
                  </div>
                </div>
                <div className="mt-auto text-sm font-medium text-amber-700 transition-colors group-hover:text-amber-800 dark:text-amber-400 dark:group-hover:text-amber-300">
                  Open game →
                </div>
              </div>
            </Link>
          ))}
        </section>
      </div>
    </div>
  );
}
