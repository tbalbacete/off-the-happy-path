import { describe, expect, it } from 'vitest';
import { today } from '../scripts/lib/dates.mjs';
import {
  findPost,
  idFromFile,
  nextEntryNumber,
  numberFromFile,
  slugFromFile,
} from '../scripts/lib/entries.mjs';

describe('today', () => {
  it('formats the local date as YYYY-MM-DD', () => {
    expect(today(new Date(2026, 0, 5))).toBe('2026-01-05');
    expect(today(new Date(2026, 11, 31))).toBe('2026-12-31');
  });
  it('uses the local calendar day, not UTC', () => {
    // 23:30 local on Nov 14. In any zone west of UTC, toISOString() says Nov 15.
    const lateEvening = new Date(2026, 10, 14, 23, 30);
    expect(today(lateEvening)).toBe('2026-11-14');
    // Just after local midnight, east of UTC toISOString() would still say the 14th.
    expect(today(new Date(2026, 10, 15, 0, 5))).toBe('2026-11-15');
  });
  it('defaults to now', () => {
    expect(today()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe('file name helpers', () => {
  it('reads the id, slug and number from a file name', () => {
    expect(idFromFile('016-the-slug.md')).toBe('016-the-slug');
    expect(slugFromFile('016-the-slug.md')).toBe('the-slug');
    expect(numberFromFile('016-the-slug.md')).toBe(16);
    expect(numberFromFile('the-slug.md')).toBeUndefined();
  });
});

describe('nextEntryNumber', () => {
  it('is 1 for an empty folder', () => {
    expect(nextEntryNumber([])).toBe(1);
  });
  it('is the highest number plus one, drafts included', () => {
    expect(
      nextEntryNumber([
        { file: '001-hello-log.md', no: 1 },
        { file: '002-draft-example.md', no: 2 },
      ]),
    ).toBe(3);
  });
  it('does not fill gaps', () => {
    expect(nextEntryNumber([{ file: '001-a.md', no: 1 }, { file: '009-b.md', no: 9 }])).toBe(10);
  });
  it('counts the file prefix when it disagrees with the frontmatter', () => {
    expect(nextEntryNumber([{ file: '012-a.md', no: 4 }])).toBe(13);
    expect(nextEntryNumber([{ file: '004-a.md', no: 12 }])).toBe(13);
  });
  it('copes with a post that has no number yet', () => {
    expect(nextEntryNumber([{ file: 'loose.md' }, { file: '003-c.md', no: undefined }])).toBe(4);
  });
});

describe('findPost', () => {
  const posts = [
    { file: '001-hello-log.md', no: 1 },
    { file: '016-the-slug.md', no: 16 },
    { file: '017-2026-in-review.md', no: 17 },
  ];

  it('finds by entry number, with or without padding', () => {
    expect(findPost(posts, '16')?.file).toBe('016-the-slug.md');
    expect(findPost(posts, '016')?.file).toBe('016-the-slug.md');
    expect(findPost(posts, '1')?.file).toBe('001-hello-log.md');
  });
  it('finds by slug', () => {
    expect(findPost(posts, 'the-slug')?.file).toBe('016-the-slug.md');
    expect(findPost(posts, '2026-in-review')?.file).toBe('017-2026-in-review.md');
  });
  it('finds by file id or file name', () => {
    expect(findPost(posts, '016-the-slug')?.file).toBe('016-the-slug.md');
    expect(findPost(posts, '016-the-slug.md')?.file).toBe('016-the-slug.md');
  });
  it('ignores surrounding whitespace', () => {
    expect(findPost(posts, '  the-slug ')?.file).toBe('016-the-slug.md');
  });
  it('returns undefined when nothing matches', () => {
    expect(findPost(posts, '99')).toBeUndefined();
    expect(findPost(posts, 'missing')).toBeUndefined();
    expect(findPost(posts, '')).toBeUndefined();
  });
});
