import { getRequestConfig } from 'next-intl/server';
import { defaultLocale, locales } from '../lib/i18n';

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;
  if (!locale || !locales.includes(locale as any)) {
    locale = defaultLocale;
  }

  const messages = (await import(`../messages/${locale}.json`)).default;
  return { locale, messages };
});
