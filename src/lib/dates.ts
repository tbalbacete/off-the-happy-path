/**
 * Dates are plain `YYYY-MM-DD` strings everywhere. They are never passed
 * through a timezone for display.
 */

const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

/** True if `value` is a `YYYY-MM-DD` string naming a real calendar day. */
export function isDateString(value: string): boolean {
  const m = DATE_RE.exec(value);
  if (!m) return false;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const t = new Date(Date.UTC(y, mo - 1, d));
  return t.getUTCFullYear() === y && t.getUTCMonth() === mo - 1 && t.getUTCDate() === d;
}

/**
 * Normalise a frontmatter date to a `YYYY-MM-DD` string.
 *
 * YAML parses an unquoted `2026-11-12` into a Date at UTC midnight, so a Date
 * is read back in UTC (no local-timezone shift). Strings pass through as-is.
 * Anything else is returned unchanged so the schema can reject it.
 */
export function toDateString(value: unknown): unknown {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }
  return value;
}

/**
 * Check the raw `date:` and `revised:` values in a file's frontmatter.
 *
 * The YAML parser turns an unquoted impossible date such as `2026-02-30` into
 * a Date that has already rolled over (2026-03-02), so the schema never sees
 * the mistake. This reads the source text instead. Returns one message per
 * bad value; empty values (e.g. a blank `revised:`) are allowed.
 */
export function rawDateProblems(source: string): string[] {
  const fm = /^---\r?\n([\s\S]*?)\r?\n---/.exec(source);
  if (!fm) return [];
  const problems: string[] = [];
  for (const line of fm[1].split(/\r?\n/)) {
    const m = /^(date|revised):[ \t]*(.*?)[ \t]*(?:#.*)?$/.exec(line);
    if (!m) continue;
    const [, key, raw] = m;
    const value = raw.replace(/^(['"])(.*)\1$/, '$2');
    if (value === '' || value === 'null' || value === '~') continue;
    if (!isDateString(value)) {
      problems.push(`${key}: "${value}" is not a real date written as YYYY-MM-DD`);
    }
  }
  return problems;
}
