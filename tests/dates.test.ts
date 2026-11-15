import { describe, expect, it } from 'vitest';
import { isDateString, toDateString } from '../src/lib/dates';

describe('isDateString', () => {
  it('accepts real YYYY-MM-DD days', () => {
    expect(isDateString('2026-11-12')).toBe(true);
    expect(isDateString('2024-02-29')).toBe(true);
  });
  it('rejects other formats and impossible days', () => {
    expect(isDateString('2026-1-12')).toBe(false);
    expect(isDateString('12/11/2026')).toBe(false);
    expect(isDateString('2026-02-30')).toBe(false);
    expect(isDateString('2025-02-29')).toBe(false);
  });
});

describe('toDateString', () => {
  it('reads a YAML date (UTC midnight) back without a timezone shift', () => {
    expect(toDateString(new Date('2026-11-12T00:00:00Z'))).toBe('2026-11-12');
  });
  it('passes strings and other values through', () => {
    expect(toDateString('2026-11-12')).toBe('2026-11-12');
    expect(toDateString(42)).toBe(42);
  });
});
