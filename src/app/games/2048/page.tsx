import type { Metadata } from "next";
import { Game2048 } from "@/components/games/2048/Game2048";
import { BreadcrumbJsonLd, SoftwareApplicationJsonLd } from "@/components/seo/jsonld";
import { createDefaultOgImage, defaultOgImage, siteUrl } from "@/lib/seo";

const canonical = `${siteUrl}/games/2048`;
const title = "2048 Online";
const description =
  "Play 2048 online with 4x4 to 9x9 boards, balanced or standard goals, custom auto-play strategies, keyboard controls, and touch support.";

export const metadata: Metadata = {
  title,
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
    title: `${title} | pairusuo`,
    description,
    siteName: "pairusuo",
    locale: "en_US",
    images: [createDefaultOgImage("2048 Online | pairusuo")],
  },
  twitter: {
    card: "summary_large_image",
    title: `${title} | pairusuo`,
    description,
    images: [defaultOgImage],
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
        image={defaultOgImage}
        applicationCategory="GameApplication"
      />
      <Game2048 />
    </div>
  );
}
