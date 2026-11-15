/** Pure helpers for the archive page. */

interface Dated {
  data: { no: number; date: string };
}

export interface ArchiveYear<T> {
  /** `2026`, read from the `YYYY-MM-DD` string. */
  year: string;
  /** Newest first. */
  posts: T[];
}

/**
 * Posts grouped by the year they were filed: newest year first, newest entry
 * first within a year. The year comes from the date string, never through
 * `Date`, so time zones can't move an entry across New Year.
 */
export function archiveByYear<T extends Dated>(posts: readonly T[]): ArchiveYear<T>[] {
  const byYear = new Map<string, T[]>();
  for (const post of posts) {
    const year = post.data.date.slice(0, 4);
    byYear.set(year, [...(byYear.get(year) ?? []), post]);
  }
  return [...byYear]
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([year, list]) => ({ year, posts: list.sort((a, b) => b.data.no - a.data.no) }));
}
