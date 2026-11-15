// @ts-check
/**
 * Read a post's frontmatter, and change single fields by editing only their
 * line. The file is never re-serialised, so comments, quoting, key order and
 * the body survive exactly as written.
 *
 * The reader understands the small YAML subset posts use: `key: value`
 * scalars (quoted or not), `[a, b]` flow lists, `- a` block lists, and
 * `#` comments. The site's real parser and schema stay the source of truth;
 * this is only for the scripts to find and inspect posts.
 */

/**
 * @typedef {string | number | boolean | null | string[]} FieldValue
 */

const FRONTMATTER_RE = /^---[ \t]*(\r?\n)([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)/;

/**
 * Locate the frontmatter block.
 *
 * @param {string} source
 * @returns {{ eol: string, start: number, end: number, text: string }}
 *   `start`/`end` bound the frontmatter text between the fences.
 */
export function locateFrontmatter(source) {
  const m = FRONTMATTER_RE.exec(source);
  if (!m) throw new Error('No frontmatter found: the file must start with a --- fenced block.');
  const eol = m[1];
  const start = 3 + source.slice(3).indexOf(eol) + eol.length;
  const text = m[2];
  return { eol, start, end: start + text.length, text };
}

/**
 * Strip a trailing ` # comment` from an unquoted value.
 *
 * @param {string} raw
 */
function stripComment(raw) {
  const i = raw.search(/(^|\s)#/);
  return (i === -1 ? raw : raw.slice(0, i)).trim();
}

/**
 * Parse a quoted scalar at the start of `raw`, returning the value and the rest.
 *
 * @param {string} raw
 * @returns {{ value: string, rest: string } | undefined}
 */
function parseQuoted(raw) {
  if (raw.startsWith('"')) {
    const m = /^"((?:[^"\\]|\\.)*)"/.exec(raw);
    if (!m) return undefined;
    return { value: JSON.parse(`"${m[1]}"`), rest: raw.slice(m[0].length) };
  }
  if (raw.startsWith("'")) {
    const m = /^'((?:[^']|'')*)'/.exec(raw);
    if (!m) return undefined;
    return { value: m[1].replace(/''/g, "'"), rest: raw.slice(m[0].length) };
  }
  return undefined;
}

/**
 * @param {string} raw
 * @returns {string}
 */
function parseListItem(raw) {
  const t = raw.trim();
  return parseQuoted(t)?.value ?? t;
}

/**
 * @param {string} raw  Everything after `key:` on the line.
 * @returns {FieldValue}
 */
function parseScalar(raw) {
  const trimmed = raw.trim();
  const quoted = parseQuoted(trimmed);
  if (quoted) return quoted.value;
  if (trimmed.startsWith('[')) {
    const close = trimmed.indexOf(']');
    const inner = trimmed.slice(1, close === -1 ? undefined : close);
    return inner.trim() === '' ? [] : inner.split(',').map(parseListItem);
  }
  const value = stripComment(trimmed);
  if (value === '' || value === 'null' || value === '~') return null;
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (/^-?\d+$/.test(value)) return Number(value);
  return value;
}

/**
 * Read the top-level fields of a post's frontmatter.
 *
 * @param {string} source  The whole file.
 * @returns {Record<string, FieldValue>}
 */
export function readFrontmatter(source) {
  const { text } = locateFrontmatter(source);
  const lines = text.split(/\r?\n/);
  /** @type {Record<string, FieldValue>} */
  const fields = {};
  for (let i = 0; i < lines.length; i++) {
    const m = /^([A-Za-z_][\w-]*):(.*)$/.exec(lines[i]);
    if (!m) continue;
    const [, key, raw] = m;
    let value = parseScalar(raw);
    if (value === null) {
      /** @type {string[]} */
      const items = [];
      while (i + 1 < lines.length) {
        const item = /^\s*-\s+(.*)$/.exec(lines[i + 1]);
        if (!item) break;
        items.push(parseListItem(stripComment(item[1])));
        i++;
      }
      if (items.length > 0) value = items;
    }
    fields[key] = value;
  }
  return fields;
}

/**
 * Set one top-level scalar field by rewriting only its line.
 *
 * The space after the colon and any trailing `# comment` are kept. With
 * `keepQuotes`, a value that was quoted stays quoted in the same style. A
 * missing key is added as the last frontmatter line.
 *
 * @param {string} source  The whole file.
 * @param {string} key
 * @param {string} rawValue  The YAML text to write, e.g. `false` or `2026-11-14`.
 * @param {{ keepQuotes?: boolean }} [options]
 * @returns {string}
 */
export function setField(source, key, rawValue, { keepQuotes = false } = {}) {
  const { eol, start, end, text } = locateFrontmatter(source);
  const lines = text.split(/\r?\n/);
  const lineRe = new RegExp(
    `^(${key}:)([ \\t]*)("(?:[^"\\\\]|\\\\.)*"|'(?:[^']|'')*'|.*?)((?:[ \\t]+#.*)?)[ \\t]*$`,
  );
  const index = lines.findIndex((line) => lineRe.test(line));

  if (index === -1) {
    lines.push(`${key}: ${rawValue}`);
  } else {
    const [, label, space, oldValue, comment] = /** @type {RegExpExecArray} */ (
      lineRe.exec(lines[index])
    );
    const quote = keepQuotes && /^["']/.test(oldValue) ? oldValue[0] : '';
    lines[index] = `${label}${space || ' '}${quote}${rawValue}${quote}${comment}`;
  }

  return source.slice(0, start) + lines.join(eol) + source.slice(end);
}

/**
 * Set `draft:` to true or false.
 *
 * @param {string} source
 * @param {boolean} draft
 */
export function setDraft(source, draft) {
  return setField(source, 'draft', String(draft));
}

/**
 * Set `date:` to a `YYYY-MM-DD` string, keeping its quoting style.
 *
 * @param {string} source
 * @param {string} date
 */
export function setDate(source, date) {
  return setField(source, 'date', date, { keepQuotes: true });
}
