import { describe, expect, it } from 'vitest';
import { entryCount } from '../src/lib/pages';

describe('entryCount', () => {
  it('uses the singular for one entry', () => {
    expect(entryCount(1)).toBe('1 entry');
  });
  it('uses the plural for none and for many', () => {
    expect(entryCount(0)).toBe('0 entries');
    expect(entryCount(3)).toBe('3 entries');
  });
});
