"use client";
import { usePathname, useRouter } from "next/navigation";

export default function LangSwitcher({ currentLocale }: { currentLocale: string }) {
  const pathname = usePathname();
  const router = useRouter();

  const switchTo = (target: string) => {
    if (!pathname) return;
    // Persist selection to align with next-intl middleware expectations
    try {
      document.cookie = `NEXT_LOCALE=${target}; path=/; max-age=31536000`;
    } catch {}
    const hasLocalePrefix = /^\/(zh|en)(?=\/|$)/.test(pathname);
    // Remove existing locale prefix to get base path
    const basePath = hasLocalePrefix ? pathname.replace(/^\/(zh|en)(?=\/|$)/, "") : pathname;
    // If on a blog detail page (including nested slugs), prefer list page when switching locales
    const isBlogDetail = basePath.startsWith("/blog/");
    const normalizedBase = isBlogDetail ? "/blog" : basePath;
    if (target === "zh") {
      // zh pages are under /zh/ prefix in static export
      const nextPath = normalizedBase === "" ? "/" : `/zh${normalizedBase}`;
      try { router.prefetch(nextPath); } catch {}
      router.replace(nextPath);
    } else if (target === "en") {
      // ensure /en prefix
      const rest = normalizedBase === "/" ? "" : normalizedBase;
      const nextPath = rest.startsWith("/en") ? rest : (rest === "/" ? "/en" : "/en" + rest);
      try { router.prefetch(nextPath); } catch {}
      router.replace(nextPath);
    }
  };

  return (
    <div className="inline-flex border rounded overflow-hidden text-sm">
      <button
        className={`h-8 w-10 inline-flex items-center justify-center ${currentLocale === "zh" ? "bg-foreground text-background" : "bg-background"}`}
        onClick={() => switchTo("zh")}
        aria-pressed={currentLocale === "zh"}
      >
        中
      </button>
      <button
        className={`h-8 w-10 inline-flex items-center justify-center ${currentLocale === "en" ? "bg-foreground text-background" : "bg-background"}`}
        onClick={() => switchTo("en")}
        aria-pressed={currentLocale === "en"}
      >
        EN
      </button>
    </div>
  );
}
