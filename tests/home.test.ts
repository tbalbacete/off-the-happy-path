import { describe, expect, it } from 'vitest';
import { entryMeta, entrySummary, homeEntries, navItemForType, postsOfType, type PostType } from '../src/lib/home';

const post = (no: number, type: PostType = 'essay') => ({ id: `${no}`, data: { no, type } });
/** Newest first, like getPosts returns them. */
const newestFirst = (n: number) => Array.from({ length: n }, (_, i) => post(n - i));
const nos = (ps: { data: { no: number } }[]) => ps.map((p) => p.data.no);

describe('homeEntries', () => {
  it('handles no posts', () => {
    expect(homeEntries([])).toEqual({ featured: null, rows: [], older: null });
  });

  it('features the only post and has no rows', () => {
    const { featured, rows, older } = homeEntries(newestFirst(1));
    expect(featured?.data.no).toBe(1);
    expect(rows).toEqual([]);
    expect(older).toBeNull();
  });

  it('shows all posts when they fit, with no older link', () => {
    const { featured, rows, older } = homeEntries(newestFirst(7));
    expect(featured?.data.no).toBe(7);
    expect(nos(rows)).toEqual([6, 5, 4, 3, 2, 1]);
    expect(older).toBeNull();
  });

  it('gives the range of entries beyond the page', () => {
    const { featured, rows, older } = homeEntries(newestFirst(15));
    expect(featured?.data.no).toBe(15);
    expect(nos(rows)).toEqual([14, 13, 12, 11, 10, 9]);
    expect(older).toEqual({ from: 8, to: 1 });
  });

  it('gives a one-entry range when exactly one is left over', () => {
    expect(homeEntries(newestFirst(8)).older).toEqual({ from: 1, to: 1 });
  });

  it('uses entry numbers, not positions, when numbers have gaps', () => {
    const posts = [20, 18, 17, 9, 4].map((n) => post(n));
    const { rows, older } = homeEntries(posts, 3);
    expect(nos(rows)).toEqual([18, 17]);
    expect(older).toEqual({ from: 9, to: 4 });
  });

  it('respects a custom count', () => {
    const { rows, older } = homeEntries(newestFirst(5), 2);
    expect(nos(rows)).toEqual([4]);
    expect(older).toEqual({ from: 3, to: 1 });
  });

  it('does not mutate the input', () => {
    const input = newestFirst(10);
    homeEntries(input);
    expect(nos(input)).toEqual([10, 9, 8, 7, 6, 5, 4, 3, 2, 1]);
  });
});

describe('postsOfType', () => {
  const posts = [post(5, 'rant'), post(4, 'essay'), post(3, 'note'), post(2, 'essay'), post(1, 'note')];

  it('keeps only posts of the given type, in order', () => {
    expect(nos(postsOfType(posts, 'essay'))).toEqual([4, 2]);
    expect(nos(postsOfType(posts, 'note'))).toEqual([3, 1]);
    expect(nos(postsOfType(posts, 'rant'))).toEqual([5]);
  });

  it('returns an empty list when no post has the type', () => {
    expect(postsOfType([post(1, 'note')], 'rant')).toEqual([]);
  });
});

describe('entryMeta', () => {
  it('joins minutes and tag labels the way the artboard shows them', () => {
    expect(entryMeta(9, ['process', 'requirements'])).toBe('9 MIN · PROCESS, REQUIREMENTS');
  });
  it('turns multi-word tags into spaced labels', () => {
    expect(entryMeta(3, ['legacy-code'])).toBe('3 MIN · LEGACY CODE');
  });
  it('shows only the minutes when there are no tags', () => {
    expect(entryMeta(1, [])).toBe('1 MIN');
  });
});

describe('entrySummary', () => {
  const base = {
    id: '015-nobody-reads-the-ticket',
    body: Array.from({ length: 2000 }, () => 'word').join(' '),
    data: {
      no: 15,
      title: 'Nobody reads the ticket',
      dek: 'On where requirements actually live.',
      type: 'essay' as const,
      date: '2026-11-12',
      tags: ['process', 'requirements'],
      draft: false,
    },
  };

  it('builds the link, reading time and meta line from the post', () => {
    expect(entrySummary(base)).toEqual({
      no: 15,
      href: '/log/nobody-reads-the-ticket/',
      title: 'Nobody reads the ticket',
      dek: 'On where requirements actually live.',
      type: 'essay',
      date: '2026-11-12',
      meta: '9 MIN · PROCESS, REQUIREMENTS',
      draft: false,
    });
  });

  it('counts a missing body as one minute and passes the draft flag through', () => {
    const s = entrySummary({ ...base, body: undefined, data: { ...base.data, tags: [], draft: true } });
    expect(s.meta).toBe('1 MIN');
    expect(s.draft).toBe(true);
  });
});

describe('navItemForType', () => {
  it('marks NOTES on the note page and WRITING on the others', () => {
    expect(navItemForType('note')).toBe('notes');
    expect(navItemForType('essay')).toBe('writing');
    expect(navItemForType('rant')).toBe('writing');
  });
});
