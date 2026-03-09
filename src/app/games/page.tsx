import type { Metadata } from "next";
import Link from "next/link";
import { CollectionPageJsonLd, BreadcrumbJsonLd } from "@/components/seo/jsonld";
import { createDefaultOgImage, gamesOgImage, siteUrl, twitterHandle } from "@/lib/seo";

const canonical = `${siteUrl}/games`;
const title = "Games";
const description =
  "Play browser games on pairusuo.top, starting with 2048 and more lightweight web games over time.";

export const metadata: Metadata = {
  title,
  description,
  keywords: ["browser games", "web games", "2048", "pairusuo games"],
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
    description:
      "A rebuilt 2048 page with larger board sizes, balanced or standard targets, and auto-play strategies.",
    meta: ["4×4 to 9×9", "Auto Play", "Keyboard + Touch"],
  },
];

export default function GamesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 pb-16">
      <BreadcrumbJsonLd
        items={[
          { name: "Home", item: "https://pairusuo.top" },
          { name: "Games", item: canonical },
        ]}
      />
      <CollectionPageJsonLd
        name="pairusuo Games"
        url={canonical}
        description={description}
      />
      <section className="rounded-[2rem] border border-stone-200/70 bg-[linear-gradient(135deg,rgba(255,247,230,0.98),rgba(255,252,246,0.98))] p-6 shadow-sm dark:border-stone-700/70 dark:bg-[linear-gradient(135deg,rgba(41,37,36,0.98),rgba(28,25,23,0.98))]">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-700 dark:text-amber-400">
          pairusuo games
        </p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-stone-900 dark:text-stone-100 sm:text-5xl">
          Games
        </h1>
        <p className="mt-4 max-w-4xl text-base leading-8 text-stone-600 dark:text-stone-300">
          Small browser games built for quick play, simple controls, and a clean experience on both desktop and mobile.
        </p>
      </section>

      <section className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {games.map((game) => (
          <Link
            key={game.href}
            href={game.href}
            title={game.title}
            className="group rounded-[1.75rem] border border-stone-200/70 bg-white p-5 shadow-sm transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg dark:border-stone-700/70 dark:bg-stone-900"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-2xl font-black tracking-tight text-stone-900 dark:text-stone-100">
                  {game.title}
                </h2>
                <p className="mt-3 text-sm leading-7 text-stone-600 dark:text-stone-300">
                  {game.description}
                </p>
              </div>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300">
                {game.badge}
              </span>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {game.meta.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-xs font-medium text-stone-600 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300"
                >
                  {item}
                </span>
              ))}
            </div>

            <div className="mt-6 text-sm font-semibold text-amber-700 transition-colors group-hover:text-amber-800 dark:text-amber-400 dark:group-hover:text-amber-300">
              Open game →
            </div>
          </Link>
        ))}
      </section>
    </div>
  );
}
