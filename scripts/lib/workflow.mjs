// @ts-check
/**
 * The new-post and publish steps, with the posts folder passed in so tests
 * can run them against a temp directory. The CLI scripts only gather input,
 * call these, and print.
 */
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { nextEntryNumber, slugFromFile } from './entries.mjs';
import { readFrontmatter } from './frontmatter.mjs';
import { postFileName, slugify } from './slug.mjs';
import { fillTemplate, templateValues } from './template.mjs';

/** A problem with the user's input. Scripts print the message and exit 1. */
export class UsageError extends Error {
  name = 'UsageError';
}

/**
 * @typedef {object} PostFile
 * @property {string} file  e.g. `016-the-slug.md`
 * @property {string} path  Full path.
 * @property {string} slug
 * @property {number | undefined} no
 * @property {Record<string, import('./frontmatter.mjs').FieldValue>} data
 * @property {string} source
 */

/**
 * Read every post in the folder. A post whose frontmatter can't be read is
 * still listed (with empty data), so its slug and number stay reserved.
 *
 * @param {string} postsDir
 * @returns {Promise<PostFile[]>}
 */
export async function listPosts(postsDir) {
  const files = (await readdir(postsDir)).filter((f) => f.endsWith('.md')).sort();
  return Promise.all(
    files.map(async (file) => {
      const path = join(postsDir, file);
      const source = await readFile(path, 'utf8');
      /** @type {PostFile['data']} */
      let data = {};
      try {
        data = readFrontmatter(source);
      } catch {
        // Leave data empty; the site's build will report the broken file.
      }
      const no = typeof data.no === 'number' ? data.no : undefined;
      return { file, path, slug: slugFromFile(file), no, data, source };
    }),
  );
}

/**
 * Every tag used by any post, sorted.
 *
 * @param {PostFile[]} posts
 * @returns {string[]}
 */
export function existingTags(posts) {
  const tags = new Set();
  for (const { data } of posts) {
    if (Array.isArray(data.tags)) for (const t of data.tags) tags.add(t);
  }
  return [...tags].sort();
}

/**
 * Why this title can't be used for a new post, or undefined if it can.
 *
 * @param {PostFile[]} posts
 * @param {string} title
 * @returns {string | undefined}
 */
export function titleProblem(posts, title) {
  const slug = slugify(title);
  if (slug === '') return 'The title needs at least one letter or digit to make a slug from.';
  const clash = posts.find((p) => p.slug === slug);
  if (clash) return `The slug "${slug}" is already used by ${clash.file}. Pick a different title.`;
  return undefined;
}

/**
 * @typedef {object} CreatePostInput
 * @property {string} postsDir
 * @property {string} template  The template's text.
 * @property {string} title
 * @property {import('./template.mjs').NewPostFields['type']} type
 * @property {string[]} tags  Already slugs.
 * @property {string} [dek]
 * @property {string} date  `YYYY-MM-DD`
 */

/**
 * Write a new draft. Refuses an existing slug or entry number and never
 * overwrites a file.
 *
 * @param {CreatePostInput} input
 * @returns {Promise<{ file: string, path: string, slug: string, no: number }>}
 */
export async function createPost({ postsDir, template, title, type, tags, dek, date }) {
  const posts = await listPosts(postsDir);
  const problem = titleProblem(posts, title);
  if (problem) throw new UsageError(problem);

  const slug = slugify(title);
  const no = nextEntryNumber(posts);
  if (posts.some((p) => p.no === no)) {
    throw new UsageError(`Entry number ${no} is already taken.`);
  }

  const file = postFileName(no, slug);
  const path = join(postsDir, file);
  const content = fillTemplate(template, templateValues({ no, title, dek, type, date, tags }));
  try {
    await writeFile(path, content, { flag: 'wx' });
  } catch (error) {
    if (/** @type {NodeJS.ErrnoException} */ (error).code === 'EEXIST') {
      throw new UsageError(`${file} already exists. Nothing was written.`);
    }
    throw error;
  }
  return { file, path, slug, no };
}
