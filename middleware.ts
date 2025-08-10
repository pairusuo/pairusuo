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
  const response = intl(request);
  // For unprefixed paths, force cookie to zh so '/' remains Chinese even if cookie was en before
  if (!hasPrefix) {
    response.headers.append(
      'set-cookie',
      'NEXT_LOCALE=zh; Path=/; Max-Age=31536000; SameSite=Lax'
    );
  }
  return response;
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
