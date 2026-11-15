import { describe, expect, it } from 'vitest';
import { tagCounts, tagHref, tagLabel } from '../src/lib/tags';

describe('tagLabel', () => {
  it('turns hyphens into spaces and uses sentence case', () => {
    expect(tagLabel('legacy-code')).toBe('Legacy code');
    expect(tagLabel('code-review-etiquette')).toBe('Code review etiquette');
  });
  it('capitalises a single word', () => {
    expect(tagLabel('process')).toBe('Process');
  });
  it('keeps digits', () => {
    expect(tagLabel('web-3')).toBe('Web 3');
  });
  it('returns an empty string for an empty slug', () => {
    expect(tagLabel('')).toBe('');
  });
  it('uses the display name from site.tagNames when there is one', () => {
    expect(tagLabel('ai')).toBe('AI, honestly');
  });
  it('prefers a name from the map it is given', () => {
    const names = { 'legacy-code': 'Legacy code (sigh)' };
    expect(tagLabel('legacy-code', names)).toBe('Legacy code (sigh)');
    expect(tagLabel('process', names)).toBe('Process');
  });
  it('falls back to sentence case with an empty map', () => {
    expect(tagLabel('ai', {})).toBe('Ai');
  });
  it('ignores names inherited from Object.prototype', () => {
    expect(tagLabel('constructor', {})).toBe('Constructor');
  });
});

describe('tagCounts', () => {
  const post = (...tags: string[]) => ({ data: { tags } });

  it('orders by count, most used first', () => {
    const counts = tagCounts([post('career'), post('process', 'career'), post('process', 'career')]);
    expect(counts).toEqual([
      { tag: 'career', count: 3 },
      { tag: 'process', count: 2 },
    ]);
  });

  it('breaks ties alphabetically', () => {
    const counts = tagCounts([post('tooling', 'meetings'), post('burnout')]);
    expect(counts.map((c) => c.tag)).toEqual(['burnout', 'meetings', 'tooling']);
  });

  it('counts a tag once per post even if repeated', () => {
    expect(tagCounts([post('meta', 'meta')])).toEqual([{ tag: 'meta', count: 1 }]);
  });

  it('returns an empty list when no post has tags', () => {
    expect(tagCounts([post(), post()])).toEqual([]);
  });
});

describe('tagHref', () => {
  it('points at the tag page', () => {
    expect(tagHref('legacy-code')).toBe('/tag/legacy-code/');
  });
});
