import type { Metadata } from "next";
import Link from "next/link";
import { GameMinesweeper } from "@/components/games/minesweeper/GameMinesweeper";
import { BreadcrumbJsonLd, SoftwareApplicationJsonLd } from "@/components/seo/jsonld";
import { createDefaultOgImage, gamesOgImage, siteUrl, twitterHandle } from "@/lib/seo";

const canonical = `${siteUrl}/games/minesweeper`;
const title = "Play Minesweeper Online Free | Custom Bomb Uploads";
const description =
  "Play classic Minesweeper online with mobile-friendly controls, first-click protection, a clean default bomb, and custom image uploads for the mines.";

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
    images: [createDefaultOgImage("Minesweeper Online | pairusuo", gamesOgImage)],
  },
  twitter: {
    card: "summary_large_image",
    site: twitterHandle,
    title: `${title} | pairusuo`,
    description,
    images: [gamesOgImage],
  },
};

export default function MinesweeperPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 pb-16">
      <BreadcrumbJsonLd
        items={[
          { name: "Home", item: "https://pairusuo.top" },
          { name: "Games", item: "https://pairusuo.top/games" },
          { name: "Minesweeper", item: canonical },
        ]}
      />
      <SoftwareApplicationJsonLd
        name="Minesweeper"
        url={canonical}
        description={description}
        image={gamesOgImage}
        applicationCategory="GameApplication"
      />
      <GameMinesweeper />

      <section className="mt-8 rounded-[2rem] border border-stone-200/70 bg-white/80 p-5 shadow-sm ring-1 ring-stone-200/70 dark:border-stone-700/70 dark:bg-stone-900/70 dark:ring-stone-700/70">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-700 dark:text-amber-400">
              more games
            </p>
          </div>
          <Link
            href="/games"
            className="text-sm font-semibold text-amber-700 transition-colors hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-300"
          >
            Browse all games →
          </Link>
        </div>

        <Link
          href="/games/2048"
          className="mt-5 block rounded-[1.5rem] border border-stone-200/80 bg-stone-50/80 p-5 transition-colors hover:border-amber-300/80 hover:bg-amber-50/70 dark:border-stone-700 dark:bg-stone-800/70 dark:hover:border-amber-500/40 dark:hover:bg-stone-800"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="text-2xl font-black tracking-tight text-stone-900 dark:text-stone-100">2048</div>
            <span className="rounded-full bg-stone-200 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-700 dark:bg-stone-700 dark:text-stone-200">
              Live
            </span>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {["4x4 to 9x9", "Auto Play", "Keyboard + Touch"].map((item) => (
              <span
                key={item}
                className="rounded-full border border-stone-200 bg-white px-3 py-1 text-xs font-medium text-stone-600 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300"
              >
                {item}
              </span>
            ))}
          </div>
        </Link>
      </section>
    </div>
  );
}
