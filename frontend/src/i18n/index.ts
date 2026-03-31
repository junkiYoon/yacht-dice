import { ko } from './ko';

export type Locale = 'ko';

const translations = { ko };

let currentLocale: Locale = 'ko';

export function setLocale(locale: Locale) {
  currentLocale = locale;
}

export function t(): typeof ko {
  return translations[currentLocale];
}

export { ko };
