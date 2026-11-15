/**
 * Pure helpers for the home page and the type filter pages. No Astro imports;
 * they take already-filtered, newest-first posts.
 */
import { postHref } from './entries';
import { readingTime } from './reading-time';
import { tagLabel } from './tags';

export const POST_TYPES = ['essay', 'note', 'rant'] as const;
export type PostType = (typeof POST_TYPES)[number];

interface Numbered {
  data: { no: number };
}
interface Typed {
  data: { type: PostType };
}

export interface HomeEntries<T> {
  /** The newest post, or null when there are none. */
  featured: T | null;
  /** The next `count - 1` posts. */
  rows: T[];
  /** Entry numbers of the posts left off the page, or null when none are. */
  older: { from: number; to: number } | null;
}

/**
 * Split newest-first posts into the featured entry, the rows under it, and
 * the range of older entries that don't fit on the page.
 */
export function homeEntries<T extends Numbered>(posts: T[], count = 7): HomeEntries<T> {
  const shown = Math.max(1, count);
  const [featured = null, ...rest] = posts;
  const rows = rest.slice(0, shown - 1);
  const remaining = rest.slice(shown - 1);
  const older =
    remaining.length > 0
      ? {
          from: Math.max(...remaining.map((p) => p.data.no)),
          to: Math.min(...remaining.map((p) => p.data.no)),
        }
      : null;
  return { featured, rows, older };
}

/** Which main nav item a type page marks active: NOTES for notes, WRITING otherwise. */
export function navItemForType(type: PostType): 'writing' | 'notes' {
  return type === 'note' ? 'notes' : 'writing';
}

/** Posts of one type, in the order given. */
export function postsOfType<T extends Typed>(posts: T[], type: PostType): T[] {
  return posts.filter((p) => p.data.type === type);
}

/** The mono meta line under an entry: `9 MIN · PROCESS, REQUIREMENTS`. */
export function entryMeta(minutes: number, tags: readonly string[]): string {
  const parts = [`${minutes} MIN`];
  if (tags.length > 0) parts.push(tags.map((t) => tagLabel(t).toUpperCase()).join(', '));
  return parts.join(' · ');
}

interface Summarisable {
  id: string;
  body?: string;
  data: {
    no: number;
    title: string;
    dek: string;
    type: PostType;
    date: string;
    tags: readonly string[];
    draft: boolean;
  };
}

/** What an entry row or the featured entry shows. */
export interface EntrySummary {
  no: number;
  href: string;
  title: string;
  dek: string;
  type: PostType;
  date: string;
  meta: string;
  draft: boolean;
}

/** The props a list entry needs, from a post. */
export function entrySummary(post: Summarisable): EntrySummary {
  const { no, title, dek, type, date, tags, draft } = post.data;
  return {
    no,
    href: postHref(post.id),
    title,
    dek,
    type,
    date,
    meta: entryMeta(readingTime(post.body ?? ''), tags),
    draft,
  };
}
