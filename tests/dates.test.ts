import { describe, expect, it } from 'vitest';
import { isDateString, rawDateProblems, toDateString } from '../src/lib/dates';

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

describe('rawDateProblems', () => {
  const fm = (body: string) => `---\ntitle: "x"\n${body}\n---\n\nBody date: 2026-99-99\n`;

  it('accepts valid, quoted, blank and commented values', () => {
    expect(rawDateProblems(fm('date: 2026-11-14\nrevised:'))).toEqual([]);
    expect(rawDateProblems(fm('date: "2026-11-14"\nrevised: \'2026-11-15\''))).toEqual([]);
    expect(rawDateProblems(fm('date: 2026-11-14   # published\nrevised: null'))).toEqual([]);
  });
  it('flags impossible days that YAML would silently roll over', () => {
    expect(rawDateProblems(fm('date: 2026-02-30'))).toEqual([
      'date: "2026-02-30" is not a real date written as YYYY-MM-DD',
    ]);
    expect(rawDateProblems(fm('date: 2026-11-14\nrevised: 2026-13-40'))).toHaveLength(1);
  });
  it('only looks inside the frontmatter', () => {
    expect(rawDateProblems('no frontmatter\ndate: 2026-99-99')).toEqual([]);
  });
});
