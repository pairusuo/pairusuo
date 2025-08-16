export function getBaseUrl(): string {
  // Prefer env override, fallback to production domain
  const env = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (env) return env.replace(/\/$/, "");
  return "https://pairusuo.top";
}

export function absoluteUrl(path: string): string {
  const base = getBaseUrl();
  if (!path) return base;
  if (/^https?:\/\//i.test(path)) return path;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalized}`;
}
