/**
 * Which Open Graph image a post gets: its own card at `/og/<slug>.png` when
 * the file exists, the shared `site.og` image otherwise. A production build
 * refuses a published post without its card, so a post published by hand
 * (without `npm run publish`) fails loudly instead of sharing the wrong image.
 */
import { site } from '../data/site';
import { formatEntryNo } from './entries';
import type { OgImage } from './meta';

/** `/og/hello-log.png`: where `npm run og` writes a post's card, under `public/`. */
export function postCardPath(slug: string): string {
  return `/og/${slug}.png`;
}

/** `№ 002: The time we didn’t save`. */
export function postCardAlt(no: number, title: string): string {
  return `${formatEntryNo(no)}: ${title}`;
}

export interface PostOgInput {
  slug: string;
  no: number;
  title: string;
  draft: boolean;
  /** Whether `public/og/<slug>.png` exists. */
  hasCard: boolean;
  /** True in production builds. */
  production: boolean;
}

export function postOgImage({ slug, no, title, draft, hasCard, production }: PostOgInput): OgImage {
  if (hasCard) return { path: postCardPath(slug), alt: postCardAlt(no, title) };
  if (production && !draft) {
    throw new Error(
      `${formatEntryNo(no)} (${slug}) is published but has no Open Graph card at public${postCardPath(slug)}. ` +
        `Run \`npm run og -- ${no}\` and commit the PNG, then build again.`,
    );
  }
  return { path: site.og.image, alt: site.og.alt };
}
