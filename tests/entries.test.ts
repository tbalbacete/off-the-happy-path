import { describe, expect, it } from 'vitest';
import { assertUniqueEntries, formatEntryNo, slugFromId } from '../src/lib/entries';

describe('slugFromId', () => {
  it('drops the number prefix', () => {
    expect(slugFromId('001-hello-log')).toBe('hello-log');
    expect(slugFromId('1234-a-b')).toBe('a-b');
  });
  it('leaves ids without a prefix alone', () => {
    expect(slugFromId('hello-log')).toBe('hello-log');
  });
});

describe('formatEntryNo', () => {
  it('pads to three digits', () => {
    expect(formatEntryNo(7)).toBe('№ 007');
    expect(formatEntryNo(15)).toBe('№ 015');
    expect(formatEntryNo(1234)).toBe('№ 1234');
  });
});

describe('assertUniqueEntries', () => {
  it('passes for unique numbers and slugs', () => {
    expect(() =>
      assertUniqueEntries([
        { id: '001-a', no: 1 },
        { id: '002-b', no: 2 },
      ]),
    ).not.toThrow();
  });
  it('names both files when an entry number repeats', () => {
    expect(() =>
      assertUniqueEntries([
        { id: '001-a', no: 1 },
        { id: '002-b', no: 1 },
      ]),
    ).toThrow(/Entry number 1 is used by more than one post: 001-a, 002-b/);
  });
  it('names both files when a slug repeats', () => {
    expect(() =>
      assertUniqueEntries([
        { id: '001-same', no: 1 },
        { id: '002-same', no: 2 },
      ]),
    ).toThrow(/Slug "same" is used by more than one post: 001-same, 002-same/);
  });
});
