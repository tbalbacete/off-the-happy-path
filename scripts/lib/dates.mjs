// @ts-check
/**
 * Today's local calendar date as `YYYY-MM-DD`.
 *
 * Uses the local date parts on purpose: `toISOString()` is UTC, which is
 * already tomorrow in the evening west of UTC.
 *
 * @param {Date} [now]
 * @returns {string}
 */
export function today(now = new Date()) {
  const y = String(now.getFullYear()).padStart(4, '0');
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
