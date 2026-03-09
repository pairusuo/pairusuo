import type { Metadata } from "next";
import { Game2048 } from "@/components/games/2048/Game2048";

const canonical = "https://pairusuo.top/games/2048";

export const metadata: Metadata = {
  title: "2048",
  description: "2048 原生并入 pairusuo.top，支持 4×4 到 9×9、自定义目标模式和自动策略。",
  alternates: {
    canonical,
  },
  openGraph: {
    type: "website",
    url: canonical,
    title: "2048 | pairusuo",
    description: "支持多尺寸、Balanced / Standard 模式和自动策略的 2048 页面。",
  },
  twitter: {
    card: "summary_large_image",
    title: "2048 | pairusuo",
    description: "支持多尺寸、Balanced / Standard 模式和自动策略的 2048 页面。",
  },
};

export default function Game2048Page() {
  return (
    <div className="mx-auto max-w-6xl px-4 pb-16">
      <Game2048 />
    </div>
  );
}
