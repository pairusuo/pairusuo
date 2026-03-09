import type { Metadata } from "next";
import { Game2048 } from "@/components/games/2048/Game2048";
import { BreadcrumbJsonLd, SoftwareApplicationJsonLd } from "@/components/seo/jsonld";

const canonical = "https://pairusuo.top/games/2048";
const title = "2048 Online | pairusuo";
const description =
  "Play 2048 online with 4x4 to 9x9 boards, balanced or standard goals, custom auto-play strategies, keyboard controls, and touch support.";

export const metadata: Metadata = {
  title: "2048 Online",
  description,
  keywords: [
    "2048 online",
    "play 2048",
    "2048 game",
    "browser game",
    "web game",
    "auto play 2048",
  ],
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
    title,
    description,
    siteName: "pairusuo",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
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
        applicationCategory="GameApplication"
      />
      <Game2048 />
    </div>
  );
}
