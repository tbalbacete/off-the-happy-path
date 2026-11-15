/**
 * Pure helpers for the post page. No Astro imports; they take plain post data
 * and already-filtered, newest-first post lists.
 */
import { site } from '../data/site';
import { formatEntryNo, padEntryNo, postHref } from './entries';
import { tagHref, tagLabel } from './tags';

interface Numbered {
  data: { no: number };
}

export interface Neighbours<T> {
  /** The next-older entry, or null on the oldest. */
  previous: T | null;
  /** The next-newer entry, or null on the newest. */
  next: T | null;
}

/**
 * The entries either side of entry `no` in a newest-first list (whatever
 * `getPosts` returns, so drafts only take part in dev).
 */
export function prevNext<T extends Numbered>(posts: readonly T[], no: number): Neighbours<T> {
  const i = posts.findIndex((p) => p.data.no === no);
  if (i === -1) throw new Error(`Entry ${no} is not in the list of posts`);
  return { previous: posts[i + 1] ?? null, next: posts[i - 1] ?? null };
}

/** What a previous/next cell shows. */
export interface NeighbourLink {
  no: number;
  title: string;
  href: string;
}

/** A neighbour as a previous/next link, or null at that end of the log. */
export function neighbourLink(post: { id: string; data: { no: number; title: string } } | null): NeighbourLink | null {
  return post ? { no: post.data.no, title: post.data.title, href: postHref(post.id) } : null;
}

/** The reply subject: `Re: № 015`. */
export function replySubject(no: number): string {
  return `${site.post.reply.subjectPrefix}${formatEntryNo(no)}`;
}

/** A `mailto:` link with the reply subject filled in and URL-encoded. */
export function replyHref(email: string, no: number): string {
  return `mailto:${email}?subject=${encodeURIComponent(replySubject(no))}`;
}

export interface MetaLink {
  label: string;
  href: string;
}

export interface MetaRow {
  label: string;
  /** Plain text value. Ignored when `links` is set. */
  value: string;
  /** Tag links, for FILED UNDER. */
  links?: MetaLink[];
}

interface MetaSource {
  data: {
    no: number;
    date: string;
    revised?: string | null;
    tags: readonly string[];
    confidence?: string;
  };
}

/**
 * The entry details column, in order: entry, filed, revised, reading time,
 * filed under, and confidence (only when the post has one).
 */
export function postMeta(post: MetaSource, minutes: number): MetaRow[] {
  const m = site.post.meta;
  const { no, date, revised, tags, confidence } = post.data;
  const rows: MetaRow[] = [
    { label: m.entry, value: padEntryNo(no) },
    { label: m.filed, value: date },
    { label: m.revised, value: revised || m.none },
    { label: m.readingTime, value: `${minutes} ${m.minutes}` },
    tags.length > 0
      ? {
          label: m.filedUnder,
          value: tags.map(tagLabel).join(', '),
          links: tags.map((t) => ({ label: tagLabel(t), href: tagHref(t) })),
        }
      : { label: m.filedUnder, value: m.none },
  ];
  if (confidence) rows.push({ label: m.confidence, value: confidence });
  return rows;
}
