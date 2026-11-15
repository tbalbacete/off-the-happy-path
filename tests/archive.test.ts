import { describe, expect, it } from 'vitest';
import { archiveByYear } from '../src/lib/archive';

const post = (no: number, date: string) => ({ data: { no, date } });
const shape = (groups: ReturnType<typeof archiveByYear<ReturnType<typeof post>>>) =>
  groups.map((g) => [g.year, g.posts.map((p) => p.data.no)]);

describe('archiveByYear', () => {
  it('returns an empty list for no posts', () => {
    expect(archiveByYear([])).toEqual([]);
  });

  it('puts one year in one group', () => {
    expect(shape(archiveByYear([post(2, '2026-03-01'), post(1, '2026-01-02')]))).toEqual([['2026', [2, 1]]]);
  });

  it('splits at the year boundary, newest year first', () => {
    const groups = archiveByYear([post(3, '2027-01-01'), post(2, '2026-12-31'), post(1, '2025-06-15')]);
    expect(shape(groups)).toEqual([
      ['2027', [3]],
      ['2026', [2]],
      ['2025', [1]],
    ]);
  });

  it('orders years and entries newest first whatever the input order', () => {
    const groups = archiveByYear([post(1, '2025-02-01'), post(4, '2026-05-01'), post(2, '2025-09-01'), post(3, '2026-01-01')]);
    expect(shape(groups)).toEqual([
      ['2026', [4, 3]],
      ['2025', [2, 1]],
    ]);
  });

  it('reads the year from the string, so 1 January stays in its year in any time zone', () => {
    expect(archiveByYear([post(1, '2026-01-01')])[0].year).toBe('2026');
  });

  it('does not mutate the input', () => {
    const posts = [post(1, '2025-02-01'), post(2, '2026-01-01')];
    const copy = structuredClone(posts);
    archiveByYear(posts);
    expect(posts).toEqual(copy);
  });
});
