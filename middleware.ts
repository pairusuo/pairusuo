import createMiddleware from 'next-intl/middleware';
import type { NextRequest } from 'next/server';

const intl = createMiddleware({
  locales: ['zh', 'en'],
  defaultLocale: 'zh',
  localePrefix: 'as-needed',
  localeDetection: false,
});

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasPrefix = /^\/(zh|en)(?=\/|$)/.test(pathname);
  // Keep locale resolution via next-intl; avoid setting cookies to maximize cacheability
  return intl(request);
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
