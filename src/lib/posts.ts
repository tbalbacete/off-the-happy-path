import { getCollection, type CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'posts'>;

interface Draftable {
  data: { draft: boolean };
}
interface Numbered {
  data: { no: number };
}

/**
 * The draft rule. This is the only place it is applied:
 * drafts are included in dev and excluded from production builds.
 */
export function filterDrafts<T extends Draftable>(posts: T[], includeDrafts: boolean): T[] {
  return includeDrafts ? [...posts] : posts.filter((p) => !p.data.draft);
}

/** Newest first, by entry number descending. Does not mutate the input. */
export function sortNewestFirst<T extends Numbered>(posts: T[]): T[] {
  return [...posts].sort((a, b) => b.data.no - a.data.no);
}

/** All posts visible in this environment, newest first. */
export async function getPosts(): Promise<Post[]> {
  const all = await getCollection('posts');
  return sortNewestFirst(filterDrafts(all, import.meta.env.DEV));
}
