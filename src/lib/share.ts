/**
 * The share box's links: one plain `href` per network, built from the post's
 * canonical URL and title. Every value goes through `encodeURIComponent`, so
 * spaces are `%20` (never `+`, which some mail clients show literally) and the
 * post URL never sits unencoded inside another URL's query.
 */
import { site } from '../data/site';

export type ShareNetwork = (typeof site.post.share.networks)[number]['id'];

export interface ShareLink {
  id: ShareNetwork;
  label: string;
  href: string;
}

const e = encodeURIComponent;

const builders: Record<ShareNetwork, (url: string, title: string) => string> = {
  email: (url, title) => `mailto:?subject=${e(title)}&body=${e(url)}`,
  linkedin: (url) => `https://www.linkedin.com/sharing/share-offsite/?url=${e(url)}`,
  bluesky: (url, title) => `https://bsky.app/intent/compose?text=${e(`${title} ${url}`)}`,
  x: (url, title) => `https://x.com/intent/post?text=${e(title)}&url=${e(url)}`,
};

/** The share links for a post, in `site.post.share.networks` order. */
export function shareLinks(url: string, title: string): ShareLink[] {
  return site.post.share.networks.map(({ id, label }) => ({ id, label, href: builders[id](url, title) }));
}
