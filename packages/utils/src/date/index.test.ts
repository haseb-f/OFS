import { describe, it, expect } from 'vitest';
import { formatDate, DATE_DISPLAY_REGEX } from './index.js';

describe('formatDate', () => {
  it('formats a date as DD MMM YYYY in English', () => {
    expect(formatDate(new Date('2026-01-15'), 'en')).toBe('15 Jan 2026');
  });

  it('formats a date as DD MMM [Arabic month] YYYY by default', () => {
    const result = formatDate(new Date('2026-01-15'));
    expect(result).toBe('15 يناير 2026');
  });

  it('formats all 12 months in Arabic', () => {
    const months = [
      '01 يناير 2026',
      '01 فبراير 2026',
      '01 مارس 2026',
      '01 أبريل 2026',
      '01 مايو 2026',
      '01 يونيو 2026',
      '01 يوليو 2026',
      '01 أغسطس 2026',
      '01 سبتمبر 2026',
      '01 أكتوبر 2026',
      '01 نوفمبر 2026',
      '01 ديسمبر 2026',
    ];
    for (let i = 0; i < 12; i++) {
      const month = String(i + 1).padStart(2, '0');
      expect(formatDate(new Date(`2026-${month}-01`))).toBe(months[i]);
    }
  });

  it('accepts an ISO string input', () => {
    expect(formatDate('2026-05-24', 'en')).toBe('24 May 2026');
  });

  it('pads single-digit days with leading zero', () => {
    expect(formatDate(new Date('2026-01-05'), 'en')).toBe('05 Jan 2026');
  });

  it('throws on invalid date', () => {
    expect(() => formatDate('not-a-date')).toThrow('formatDate received an invalid date');
  });

  it('throws on Invalid Date object', () => {
    expect(() => formatDate(new Date('invalid'))).toThrow('formatDate received an invalid date');
  });
});

describe('DATE_DISPLAY_REGEX', () => {
  it('matches valid DD MMM YYYY strings', () => {
    expect(DATE_DISPLAY_REGEX.test('01 Jan 2026')).toBe(true);
    expect(DATE_DISPLAY_REGEX.test('24 May 2026')).toBe(true);
    expect(DATE_DISPLAY_REGEX.test('31 Dec 2025')).toBe(true);
  });

  it('rejects invalid formats', () => {
    expect(DATE_DISPLAY_REGEX.test('2026-01-01')).toBe(false);
    expect(DATE_DISPLAY_REGEX.test('1 Jan 2026')).toBe(false);
    expect(DATE_DISPLAY_REGEX.test('01-Jan-2026')).toBe(false);
  });
});
