/**
 * OFS Enterprise Format Utilities
 * All output uses English (Latin) digits and "24 May 2026" date style.
 * Do NOT use toLocaleString('ar-SA') — it produces Arabic-Indic digits.
 */

const NUM_FMT_2  = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const NUM_FMT_0  = new Intl.NumberFormat('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
const DATE_LONG  = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long',  year: 'numeric' });
const DATE_SHORT = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
const DATE_MONTH = new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric' });

/** "125,000.00" */
export function fNum(value: number | string, decimals = 2): string {
  const n = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(n)) return '—';
  return decimals === 0 ? NUM_FMT_0.format(n) : NUM_FMT_2.format(n);
}

/** "125,000.00 SAR" */
export function fCurrency(value: number | string, currency = 'SAR'): string {
  return `${fNum(value)} ${currency}`;
}

/**
 * "24 May 2026"
 * Accepts ISO string, Date, or Arabic date string like "24 مايو 2026".
 * Returns "—" for invalid/empty input.
 */
export function fDate(value: Date | string | null | undefined, short = false): string {
  if (!value) return '—';
  let d: Date;
  if (value instanceof Date) {
    d = value;
  } else {
    // Try ISO parse first
    const iso = Date.parse(value);
    if (!isNaN(iso)) {
      d = new Date(iso);
    } else {
      // Fallback for Arabic month strings — extract year from the string
      const match = /(\d{1,2})\D+(\d{4})/.exec(value);
      if (match) {
        // Can't reliably convert Arabic month names — return raw value
        return value;
      }
      return value;
    }
  }
  if (isNaN(d.getTime())) return '—';
  return short ? DATE_SHORT.format(d) : DATE_LONG.format(d);
}

/** "May 2026" */
export function fMonthYear(d: Date): string {
  return DATE_MONTH.format(d);
}

/** Parse "2026-05-24" → Date, or null */
export function parseISODate(iso: string): Date | null {
  if (!iso) return null;
  const [y, m, day] = iso.split('-').map(Number);
  if (!y || !m || !day) return null;
  return new Date(y, m - 1, day);
}

/** Format Date → "2026-05-24" */
export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${String(y)}-${m}-${day}`;
}
