/** Pure helpers for tags. Tags are lowercase slugs such as `legacy-code`. */

interface Tagged {
  data: { tags: readonly string[] };
}

/** `legacy-code` -> `Legacy code`: hyphens to spaces, sentence case. */
export function tagLabel(slug: string): string {
  const words = slug.split('-').filter(Boolean).join(' ');
  return words.charAt(0).toUpperCase() + words.slice(1);
}

export interface TagCount {
  tag: string;
  count: number;
}

/** Every tag in use with its post count: most used first, then alphabetical. */
export function tagCounts(posts: Tagged[]): TagCount[] {
  const counts = new Map<string, number>();
  for (const post of posts) {
    for (const tag of new Set(post.data.tags)) counts.set(tag, (counts.get(tag) ?? 0) + 1);
  }
  return [...counts]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

/** A tag's page: `legacy-code` -> `/tag/legacy-code/`. M4 builds these pages. */
export function tagHref(slug: string): string {
  return `/tag/${slug}/`;
}
