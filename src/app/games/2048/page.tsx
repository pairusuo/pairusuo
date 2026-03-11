import type { Metadata } from "next";
import Link from "next/link";
import { Game2048 } from "@/components/games/2048/Game2048";
import { BreadcrumbJsonLd, SoftwareApplicationJsonLd } from "@/components/seo/jsonld";
import { createDefaultOgImage, gamesOgImage, siteUrl, twitterHandle } from "@/lib/seo";

const canonical = `${siteUrl}/games/2048`;
const title = "Play 2048 Online Free | 4x4–9x9 Boards Auto Play";
const description =
  "Play the classic 2048 puzzle game online. Choose 4x4–9x9 boards, balanced or standard goals, auto-play strategies, keyboard controls, and touch support.";

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
    images: [createDefaultOgImage("2048 Online | pairusuo", gamesOgImage)],
  },
  twitter: {
    card: "summary_large_image",
    site: twitterHandle,
    title: `${title} | pairusuo`,
    description,
    images: [gamesOgImage],
  },
};

export default function Game2048Page() {
  return (
    <div className="mx-auto max-w-6xl px-4 pb-16">
      <BreadcrumbJsonLd
        items={[
          { name: "Home", item: "https://pairusuo.top" },
          { name: "Games", item: "https://pairusuo.top/games" },
          { name: "2048", item: canonical },
        ]}
      />
      <SoftwareApplicationJsonLd
        name="2048"
        url={canonical}
        description={description}
        image={gamesOgImage}
        applicationCategory="GameApplication"
      />
      <Game2048 />

      <section className="mt-8 rounded-[2rem] border border-stone-200/70 bg-white/80 p-5 shadow-sm ring-1 ring-stone-200/70 dark:border-stone-700/70 dark:bg-stone-900/70 dark:ring-stone-700/70">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-700 dark:text-amber-400">
              more games
            </p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-stone-900 dark:text-stone-100">
              Next Game Slot
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-stone-600 dark:text-stone-300 sm:text-base">
              Another browser game will land here soon. This slot is reserved so the 2048 page can also point players
              toward the next release.
            </p>
          </div>
          <Link
            href="/games"
            className="text-sm font-semibold text-amber-700 transition-colors hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-300"
          >
            Browse all games →
          </Link>
        </div>

        <div className="mt-5 rounded-[1.5rem] border border-dashed border-stone-300/90 bg-stone-50/80 p-5 dark:border-stone-600/80 dark:bg-stone-800/60">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-2xl font-black tracking-tight text-stone-900 dark:text-stone-100">Coming Soon</div>
              <p className="mt-3 max-w-xl text-sm leading-7 text-stone-600 dark:text-stone-300">
                Placeholder for the next lightweight browser game. When the new game is ready, this card can be turned
                into a direct entry from the 2048 page.
              </p>
            </div>
            <span className="rounded-full bg-stone-200 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-700 dark:bg-stone-700 dark:text-stone-200">
              Placeholder
            </span>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {["New game", "Quick play", "Browser first"].map((item) => (
              <span
                key={item}
                className="rounded-full border border-stone-200 bg-white px-3 py-1 text-xs font-medium text-stone-600 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
