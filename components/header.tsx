"use client";
import Link from "next/link";
import { Logo } from "./logo";
import { usePathname } from "next/navigation";
import { useState, useId } from "react";
import ThemeToggle from "./theme-toggle";
import LangSwitcher from "./lang-switcher";

interface HeaderTranslations {
  home: string;
  blog: string;
  links: string;
  about: string;
}

function NavItem({ href, label, isActive }: { href: string; label: string; isActive: boolean }) {
  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={[
        "px-3 py-2 rounded-md",
        "enhanced-link smooth-transition",
        "underline-offset-4",
        isActive
          ? "font-medium text-foreground bg-accent/50"
          : "text-muted-foreground hover:text-foreground hover:bg-accent/30",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      ].join(" ")}
    >
      {label}
    </Link>
  );
}

export default function Header({ locale, translations }: { 
  locale: string;
  translations: HeaderTranslations;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const menuId = useId();

  // For default locale 'zh', drop the locale prefix from URLs
  const base = locale === 'zh' ? '' : `/${locale}`;
  const homeHref = base || '/';
  const items = [
    { href: homeHref, key: "home" as keyof HeaderTranslations, match: (p: string) => p === homeHref },
    { href: `${base}/blog`, key: "blog" as keyof HeaderTranslations, match: (p: string) => p.startsWith(`${base}/blog`) },
    { href: `${base}/links`, key: "links" as keyof HeaderTranslations, match: (p: string) => p.startsWith(`${base}/links`) },
    { href: `${base}/about`, key: "about" as keyof HeaderTranslations, match: (p: string) => p.startsWith(`${base}/about`) },
  ];

  return (
    <header className="sticky top-0 z-40 glass-morphism">
      <div className="site-container h-14 flex items-center justify-between border-b border-border/20">
        <Logo href={homeHref} width={32} height={32} showText={true} className="hover-lift focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:rounded-sm" />
        {/* Desktop nav */}
        <nav className="hidden sm:flex items-center gap-4 text-sm">
          {items.map((it) => (
            <NavItem
              key={it.key}
              href={it.href}
              label={translations[it.key]}
              isActive={it.match(pathname || "")}
            />
          ))}
          <div className="mx-1 h-4 w-px bg-border" aria-hidden />
          <ThemeToggle />
          <LangSwitcher currentLocale={locale} />
        </nav>
        {/* Mobile toggles */}
        <div className="sm:hidden flex items-center gap-2">
          <ThemeToggle />
          <LangSwitcher currentLocale={locale} />
          <button
            type="button"
            aria-expanded={open}
            aria-controls={menuId}
            onClick={() => setOpen((v) => !v)}
            className="h-9 w-9 inline-flex items-center justify-center rounded-md border border-border btn-hover hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="sr-only">Menu</span>
            {/* Hamburger icon */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>
      </div>
      {/* Mobile panel */}
      <div
        id={menuId}
        hidden={!open}
        className="sm:hidden border-t"
      >
        <nav className="site-container py-3 text-sm flex flex-col">
          {items.map((it) => (
            <Link
              key={it.key}
              href={it.href}
              onClick={() => setOpen(false)}
              aria-current={it.match(pathname || "") ? "page" : undefined}
              className={[
                "py-2",
                "transition-colors",
                it.match(pathname || "")
                  ? "font-medium underline decoration-foreground"
                  : "text-muted-foreground hover:underline hover:text-foreground",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:rounded-sm",
              ].join(" ")}
            >
              {translations[it.key]}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
