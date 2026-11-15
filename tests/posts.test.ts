import { describe, expect, it } from 'vitest';
import { filterDrafts, sortNewestFirst } from '../src/lib/posts';

const post = (no: number, draft = false) => ({ id: `post-${no}`, data: { no, draft } });

describe('sortNewestFirst', () => {
  it('sorts by entry number descending', () => {
    const sorted = sortNewestFirst([post(2), post(10), post(1), post(7)]);
    expect(sorted.map((p) => p.data.no)).toEqual([10, 7, 2, 1]);
  });
  it('does not mutate the input', () => {
    const input = [post(1), post(2)];
    sortNewestFirst(input);
    expect(input.map((p) => p.data.no)).toEqual([1, 2]);
  });
});

describe('filterDrafts', () => {
  const posts = [post(1), post(2, true), post(3)];

  it('excludes drafts when drafts are not included (production)', () => {
    expect(filterDrafts(posts, false).map((p) => p.data.no)).toEqual([1, 3]);
  });
  it('keeps drafts when drafts are included (dev)', () => {
    expect(filterDrafts(posts, true).map((p) => p.data.no)).toEqual([1, 2, 3]);
  });
  it('returns a new array either way', () => {
    expect(filterDrafts(posts, true)).not.toBe(posts);
  });
});
