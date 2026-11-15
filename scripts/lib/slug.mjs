// @ts-check
// The slug rule is shared with the site: src/lib/entries.ts is plain,
// erasable TypeScript, so Node 26 runs it directly.
import { slugFromId } from '../../src/lib/entries.ts';

export { slugFromId };

export const MAX_SLUG_LENGTH = 60;

/** Letters that NFKD does not split into a base letter plus a mark. */
const SPECIAL_LETTERS = /** @type {Record<string, string>} */ ({
  ß: 'ss',
  æ: 'ae',
  œ: 'oe',
  ø: 'o',
  ł: 'l',
  đ: 'd',
  ð: 'd',
  þ: 'th',
});

/**
 * Turn a title into a URL slug: lowercase ASCII words joined by hyphens,
 * cut at a word boundary so it is at most `max` characters long.
 * Returns '' when the title has no letters or digits.
 *
 * @param {string} title
 * @param {number} [max]
 * @returns {string}
 */
export function slugify(title, max = MAX_SLUG_LENGTH) {
  const ascii = title
    .normalize('NFKD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[ßæœøłđðþ]/g, (ch) => SPECIAL_LETTERS[ch] ?? ch)
    .replace(/['’]/g, '');
  const slug = ascii.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  if (slug.length <= max) return slug;

  const cut = slug.slice(0, max + 1);
  const lastHyphen = cut.lastIndexOf('-');
  const trimmed = lastHyphen > 0 ? cut.slice(0, lastHyphen) : slug.slice(0, max);
  return trimmed.replace(/-+$/, '');
}

/**
 * The file name a post with this number and slug gets: `016-the-slug.md`.
 *
 * @param {number} no
 * @param {string} slug
 * @returns {string}
 */
export function postFileName(no, slug) {
  return `${String(no).padStart(3, '0')}-${slug}.md`;
}
