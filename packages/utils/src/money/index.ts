/**
 * All monetary values are stored as BigInt in minor units (e.g. fils, cents).
 * Never use number or float for currency arithmetic.
 */

/** Add two BigInt money values */
export function addMoney(a: bigint, b: bigint): bigint {
  return a + b;
}

/** Subtract two BigInt money values */
export function subtractMoney(a: bigint, b: bigint): bigint {
  return a - b;
}

/**
 * Multiply a money amount by a Decimal quantity using banker's rounding.
 * quantity is a string like "1.5" or "2.250" to avoid float precision loss.
 */
export function multiplyMoney(amount: bigint, quantity: string): bigint {
  const [intPart, fracPart = ''] = quantity.split('.');
  const precision = fracPart.length;
  const scale = BigInt(10 ** precision);
  const intQ = BigInt(intPart ?? '0');
  const fracQ = BigInt(fracPart.padEnd(precision, '0') || '0');
  const quantityScaled = intQ * scale + fracQ;

  const raw = amount * quantityScaled;
  const half = scale / 2n;
  const remainder = raw % scale;

  // Banker's rounding: round half to even
  if (remainder > half) return raw / scale + 1n;
  if (remainder < half) return raw / scale;
  // exactly half — round to even
  const quotient = raw / scale;
  return quotient % 2n === 0n ? quotient : quotient + 1n;
}

/**
 * The only permitted money-to-string function.
 * amount is in minor units; divisor converts to major units.
 */
export function formatMoney(amount: bigint, currency: string, locale = 'ar-SA'): string {
  const divisor = getCurrencyDivisor(currency);
  const major = Number(amount) / divisor;
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: Math.log10(divisor),
    maximumFractionDigits: Math.log10(divisor),
  }).format(major);
}

function getCurrencyDivisor(currency: string): number {
  const zero_decimal = ['JPY', 'KRW', 'VND', 'BIF', 'CLP', 'GNF', 'MGA', 'PYG', 'RWF', 'UGX'];
  const three_decimal = ['BHD', 'IQD', 'JOD', 'KWD', 'LYD', 'OMR', 'TND'];
  if (zero_decimal.includes(currency)) return 1;
  if (three_decimal.includes(currency)) return 1000;
  return 100; // SAR, USD, EUR, etc.
}
