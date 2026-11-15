// @ts-check
import { slugFromId } from './slug.mjs';

/**
 * @typedef {object} PostRef
 * @property {string} file  File name in the posts folder, e.g. `016-the-slug.md`.
 * @property {number | undefined} [no]  The `no` from the post's frontmatter, if it has one.
 */

/**
 * `016-the-slug.md` -> `016-the-slug`.
 *
 * @param {string} file
 */
export function idFromFile(file) {
  return file.replace(/\.md$/, '');
}

/**
 * `016-the-slug.md` -> `the-slug`, using the site's slug rule.
 *
 * @param {string} file
 */
export function slugFromFile(file) {
  return slugFromId(idFromFile(file));
}

/**
 * The number prefix of a file name (`016-the-slug.md` -> 16), or undefined.
 *
 * @param {string} file
 */
export function numberFromFile(file) {
  const m = /^(\d+)-/.exec(file);
  return m ? Number(m[1]) : undefined;
}

/**
 * The next entry number: the highest existing number plus one, drafts
 * included, or 1 for an empty folder. Both the frontmatter `no` and the file
 * name prefix count, so a mismatched file can never cause a collision.
 *
 * @param {PostRef[]} posts
 * @returns {number}
 */
export function nextEntryNumber(posts) {
  let highest = 0;
  for (const post of posts) {
    for (const n of [post.no, numberFromFile(post.file)]) {
      if (typeof n === 'number' && Number.isInteger(n) && n > highest) highest = n;
    }
  }
  return highest + 1;
}

/**
 * Find a post by entry number (`16` or `016`), slug (`the-slug`) or file id
 * (`016-the-slug`, with or without `.md`). An all-digit query is tried as a
 * number first, then as a slug.
 *
 * @template {PostRef} T
 * @param {T[]} posts
 * @param {string} query
 * @returns {T | undefined}
 */
export function findPost(posts, query) {
  const q = query.trim().replace(/\.md$/, '');
  if (q === '') return undefined;
  if (/^\d+$/.test(q)) {
    const n = Number(q);
    const byNo = posts.find((p) => (p.no ?? numberFromFile(p.file)) === n);
    if (byNo) return byNo;
  }
  return (
    posts.find((p) => slugFromFile(p.file) === q) ?? posts.find((p) => idFromFile(p.file) === q)
  );
}
