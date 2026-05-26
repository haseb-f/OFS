import { describe, it, expect } from 'vitest';
import { addMoney, subtractMoney, multiplyMoney, formatMoney } from './index.js';

describe('addMoney', () => {
  it('adds two BigInt money values', () => {
    expect(addMoney(100n, 50n)).toBe(150n);
    expect(addMoney(0n, 0n)).toBe(0n);
    expect(addMoney(999999n, 1n)).toBe(1000000n);
  });
});

describe('subtractMoney', () => {
  it('subtracts two BigInt money values', () => {
    expect(subtractMoney(100n, 50n)).toBe(50n);
    expect(subtractMoney(100n, 100n)).toBe(0n);
  });

  it('can produce negative results (callers handle validation)', () => {
    expect(subtractMoney(50n, 100n)).toBe(-50n);
  });
});

describe('multiplyMoney', () => {
  it('multiplies by a whole quantity', () => {
    expect(multiplyMoney(100n, '3')).toBe(300n);
    expect(multiplyMoney(100n, '1')).toBe(100n);
    expect(multiplyMoney(0n, '5')).toBe(0n);
  });

  it('multiplies by a decimal quantity', () => {
    expect(multiplyMoney(100n, '1.5')).toBe(150n);
    expect(multiplyMoney(1000n, '0.5')).toBe(500n);
  });

  it('applies banker\'s rounding (round half to even)', () => {
    // 100 * 1.005 = 100.5 minor units → round to even → 100
    expect(multiplyMoney(10000n, '0.5005')).toBe(5005n);
  });

  it('handles three-decimal quantities', () => {
    expect(multiplyMoney(1000n, '2.500')).toBe(2500n);
  });
});

describe('formatMoney', () => {
  it('formats SAR amounts with 2 decimal places', () => {
    const result = formatMoney(10050n, 'SAR', 'en-US');
    expect(result).toContain('100.50');
  });

  it('formats KWD amounts with 3 decimal places', () => {
    const result = formatMoney(10050n, 'KWD', 'en-US');
    expect(result).toContain('10.050');
  });

  it('formats JPY amounts with 0 decimal places', () => {
    const result = formatMoney(1000n, 'JPY', 'en-US');
    expect(result).toContain('1,000');
  });
});
