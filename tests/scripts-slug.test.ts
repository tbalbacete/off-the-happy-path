import { describe, expect, it } from 'vitest';
import { slugFromId as siteSlugFromId } from '../src/lib/entries';
import { postFileName, slugFromId, slugify } from '../scripts/lib/slug.mjs';

describe('slugify', () => {
  it('lowercases and joins words with hyphens', () => {
    expect(slugify('Nobody reads the ticket')).toBe('nobody-reads-the-ticket');
  });
  it('drops punctuation and collapses separators', () => {
    expect(slugify('Estimates: apologies, in advance!')).toBe('estimates-apologies-in-advance');
    expect(slugify('a -- b __ c')).toBe('a-b-c');
  });
  it('removes apostrophes instead of splitting the word', () => {
    expect(slugify("Don't ship on Friday")).toBe('dont-ship-on-friday');
    expect(slugify('It’s fine')).toBe('its-fine');
  });
  it('strips diacritics to ASCII', () => {
    expect(slugify('Café déjà vu, naïve façade')).toBe('cafe-deja-vu-naive-facade');
    expect(slugify('Straße, Ærø, Łódź')).toBe('strasse-aero-lodz');
  });
  it('has no leading or trailing hyphen', () => {
    expect(slugify('  -- Hello? --  ')).toBe('hello');
    expect(slugify('"Quoted"')).toBe('quoted');
  });
  it('keeps digits', () => {
    expect(slugify('2026 in review')).toBe('2026-in-review');
  });
  it('returns an empty string when nothing is left', () => {
    expect(slugify('?!')).toBe('');
    expect(slugify('')).toBe('');
  });
  it('cuts long titles at a word boundary, at most 60 characters', () => {
    const title =
      'We write acceptance criteria like they are contracts and then nobody ever reads them again';
    const slug = slugify(title);
    expect(slug.length).toBeLessThanOrEqual(60);
    expect(slug).toBe('we-write-acceptance-criteria-like-they-are-contracts-and');
    expect(slug.endsWith('-')).toBe(false);
  });
  it('keeps a word that ends exactly at the limit', () => {
    expect(slugify('aaaa bbbb', 9)).toBe('aaaa-bbbb');
    expect(slugify('aaaa bbbb cc', 9)).toBe('aaaa-bbbb');
  });
  it('hard-cuts a single word longer than the limit', () => {
    expect(slugify('a'.repeat(80))).toBe('a'.repeat(60));
  });
});

describe('slugFromId (shared with the site)', () => {
  it('is the same function the site uses', () => {
    expect(slugFromId).toBe(siteSlugFromId);
  });
  it('drops only the first number prefix', () => {
    expect(slugFromId('016-the-slug')).toBe('the-slug');
    expect(slugFromId('016-2026-in-review')).toBe('2026-in-review');
  });
});

describe('postFileName', () => {
  it('pads the number to three digits', () => {
    expect(postFileName(7, 'a-note')).toBe('007-a-note.md');
    expect(postFileName(1234, 'big')).toBe('1234-big.md');
  });
  it('round-trips through the site slug rule', () => {
    const slug = slugify('2026 in review');
    expect(slugFromId(postFileName(3, slug).replace(/\.md$/, ''))).toBe(slug);
  });
});
