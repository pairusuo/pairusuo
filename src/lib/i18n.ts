import { LOCALE } from '@/config/locale';

// Import translation files based on configured language
const getMessages = () => {
  switch (LOCALE) {
    case 'zh':
      return require('../messages/zh.json');
    case 'ja':
      return require('../messages/ja.json');
    case 'en':
      return require('../messages/en.json');
    default:
      return require('../messages/zh.json');
  }
};

const messages = getMessages();

/**
 * Translation function
 * @param key Translation key, supports dot-separated nested keys like 'nav.home'
 * @returns Translated text
 */
export function t(key: string): string {
  return key.split('.').reduce((obj, k) => obj?.[k], messages) || key;
}

/**
 * Get current locale
 */
export const currentLocale = LOCALE;

/**
 * Get all translation messages
 */
export const allMessages = messages;