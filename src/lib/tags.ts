/** Pure helpers for tags. Tags are lowercase slugs such as `legacy-code`. */
import { site } from '../data/site';

interface Tagged {
  data: { tags: readonly string[] };
}

/**
 * A tag's display name: the one in `site.tagNames` if there is one
 * (`ai` -> `AI, honestly`), otherwise hyphens to spaces in sentence case
 * (`legacy-code` -> `Legacy code`).
 */
export function tagLabel(slug: string, names: Readonly<Record<string, string>> = site.tagNames): string {
  if (Object.hasOwn(names, slug)) return names[slug];
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

/** The posts carrying `tag`, in the order given (newest first from getPosts). */
export function postsWithTag<T extends Tagged>(posts: readonly T[], tag: string): T[] {
  return posts.filter((p) => p.data.tags.includes(tag));
}
