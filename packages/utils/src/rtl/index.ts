/** Wraps a string in Unicode bidi isolate marks for safe RTL embedding */
export function bidiIsolate(text: string): string {
  return `⁨${text}⁩`;
}

/** Returns true if the locale is RTL */
export function isRtlLocale(locale: string): boolean {
  const rtlLocales = ['ar', 'he', 'fa', 'ur', 'ps', 'ku', 'sd', 'ug'];
  return rtlLocales.some((l) => locale.startsWith(l));
}

/** Returns 'rtl' or 'ltr' for a given locale */
export function getTextDirection(locale: string): 'rtl' | 'ltr' {
  return isRtlLocale(locale) ? 'rtl' : 'ltr';
}
