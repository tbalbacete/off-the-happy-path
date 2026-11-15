// @ts-check
import { slugify } from './slug.mjs';

export const POST_TYPES = /** @type {const} */ (['essay', 'note', 'rant']);
export const DEFAULT_TYPE = 'essay';

/** Written when no dek is given, so the draft still passes the schema. */
export const DEK_PLACEHOLDER = 'TODO: one or two sentences for the home page.';

/**
 * A YAML double-quoted string. JSON strings are valid YAML, and this keeps
 * quotes, backslashes and colons in a title from breaking the frontmatter.
 *
 * @param {string} value
 */
export function yamlString(value) {
  return JSON.stringify(value);
}

/**
 * Collapse whitespace (including newlines) and trim.
 *
 * @param {string} value
 */
export function oneLine(value) {
  return value.replace(/\s+/g, ' ').trim();
}

/**
 * Turn `"Process, Code Review,,process"` or a list into unique tag slugs.
 *
 * @param {string | string[] | undefined} input
 * @returns {string[]}
 */
export function parseTags(input) {
  const parts = Array.isArray(input) ? input : (input ?? '').split(',');
  const tags = parts.map((t) => slugify(t)).filter((t) => t !== '');
  return [...new Set(tags)];
}

/**
 * @param {string | undefined} input
 * @returns {(typeof POST_TYPES)[number] | undefined}  undefined if not a known type.
 */
export function parseType(input) {
  const t = (input ?? '').trim().toLowerCase() || DEFAULT_TYPE;
  return POST_TYPES.find((known) => known === t);
}

/**
 * Replace every `{{name}}` with `values[name]`. Throws if a placeholder has
 * no value, so a template edit can't silently produce a broken post.
 *
 * @param {string} template
 * @param {Record<string, string>} values
 * @returns {string}
 */
export function fillTemplate(template, values) {
  const missing = new Set();
  const out = template.replace(/\{\{\s*([\w-]+)\s*\}\}/g, (_, name) => {
    if (Object.hasOwn(values, name)) return values[name];
    missing.add(name);
    return '';
  });
  if (missing.size > 0) {
    throw new Error(`The post template uses placeholders with no value: ${[...missing].join(', ')}`);
  }
  return out;
}

/**
 * @typedef {object} NewPostFields
 * @property {number} no
 * @property {string} title
 * @property {string} [dek]
 * @property {(typeof POST_TYPES)[number]} type
 * @property {string} date  `YYYY-MM-DD`
 * @property {string[]} tags  Already slugs.
 */

/**
 * The YAML text for each template placeholder.
 *
 * @param {NewPostFields} fields
 * @returns {Record<string, string>}
 */
export function templateValues({ no, title, dek, type, date, tags }) {
  const cleanDek = oneLine(dek ?? '');
  return {
    no: String(no),
    title: yamlString(oneLine(title)),
    dek: yamlString(cleanDek === '' ? DEK_PLACEHOLDER : cleanDek),
    type,
    date,
    tags: `[${tags.join(', ')}]`,
    draft: 'true',
  };
}
