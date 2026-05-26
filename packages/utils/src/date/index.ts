import { format, isValid, parseISO } from 'date-fns';

const ARABIC_MONTHS: Record<string, string> = {
  Jan: 'يناير',
  Feb: 'فبراير',
  Mar: 'مارس',
  Apr: 'أبريل',
  May: 'مايو',
  Jun: 'يونيو',
  Jul: 'يوليو',
  Aug: 'أغسطس',
  Sep: 'سبتمبر',
  Oct: 'أكتوبر',
  Nov: 'نوفمبر',
  Dec: 'ديسمبر',
};

/**
 * Formats a date as DD MMM YYYY.
 * Default locale is Arabic (month name in Arabic).
 * Pass locale='en' for English month abbreviations.
 * Throws on invalid input — no silent fallback.
 */
export function formatDate(date: Date | string, locale: 'ar' | 'en' = 'ar'): string {
  const parsed = typeof date === 'string' ? parseISO(date) : date;

  if (!isValid(parsed)) {
    throw new Error(`formatDate received an invalid date: ${String(date)}`);
  }

  const day = format(parsed, 'dd');
  const monthEn = format(parsed, 'MMM'); // e.g. "Jan"
  const year = format(parsed, 'yyyy');

  if (locale === 'en') {
    return `${day} ${monthEn} ${year}`;
  }

  const monthAr = ARABIC_MONTHS[monthEn];
  if (!monthAr) {
    throw new Error(`formatDate: no Arabic month mapping for "${monthEn}"`);
  }

  return `${day} ${monthAr} ${year}`;
}

/** DD MMM YYYY regex for validation (English months) */
export const DATE_DISPLAY_REGEX = /^\d{2} [A-Z][a-z]{2} \d{4}$/;
