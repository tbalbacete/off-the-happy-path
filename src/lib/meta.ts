/**
 * The `<head>` tags for a page: title, description, canonical URL, and the
 * Open Graph and Twitter tags. Pure, so BaseLayout only renders the result.
 */
import { site } from '../data/site';

export interface PageMetaInput {
  /** The page's own title; omitted on the home page. */
  title?: string;
  /** Defaults to the site tagline. */
  description?: string;
  /** The page path, such as `/log/hello-log/`. A trailing slash is added if missing. */
  path: string;
  /** `article` on posts, `website` everywhere else. */
  type?: 'website' | 'article';
  /** The production origin, such as `https://off-the-happy-path.vercel.app`. */
  origin: string | URL;
  /** Pages that shouldn't be indexed (the 404) get a robots tag and no canonical. */
  noindex?: boolean;
  /** The Open Graph image (1200x630) and its alt text. Defaults to the shared `site.og`. */
  image?: OgImage;
}

export interface OgImage {
  /** Root-relative, such as `/og/hello-log.png`. */
  path: string;
  alt: string;
}

/** One `<meta>`: Open Graph uses `property`, everything else `name`. */
export interface MetaTag {
  attr: 'name' | 'property';
  key: string;
  content: string;
}

export interface PageMeta {
  /** The full `<title>`: `Page - Off the Happy Path`, or the site name alone. */
  title: string;
  description: string;
  /** Absolute, with a trailing slash; null on noindex pages. */
  canonical: string | null;
  tags: MetaTag[];
}

/** `/archive` -> `/archive/`; `/` stays `/`. */
export function withTrailingSlash(path: string): string {
  return path.endsWith('/') ? path : `${path}/`;
}

/**
 * A page's absolute URL with a trailing slash: the canonical, `og:url`, and
 * the permalink the share box shows and copies.
 */
export function canonicalUrl(path: string, origin: string | URL): string {
  return new URL(withTrailingSlash(path), origin).href;
}

export function pageMeta({
  title,
  description = site.tagline,
  path,
  type = 'website',
  origin,
  noindex = false,
  image = { path: site.og.image, alt: site.og.alt },
}: PageMetaInput): PageMeta {
  const url = canonicalUrl(path, origin);
  const imageUrl = new URL(image.path, origin).href;
  const ogTitle = title ?? site.name;

  const tags: MetaTag[] = [
    { attr: 'name', key: 'description', content: description },
    ...(noindex ? [{ attr: 'name' as const, key: 'robots', content: 'noindex' }] : []),
    { attr: 'property', key: 'og:site_name', content: site.name },
    { attr: 'property', key: 'og:type', content: type },
    { attr: 'property', key: 'og:title', content: ogTitle },
    { attr: 'property', key: 'og:description', content: description },
    { attr: 'property', key: 'og:url', content: url },
    { attr: 'property', key: 'og:image', content: imageUrl },
    { attr: 'property', key: 'og:image:width', content: String(site.og.width) },
    { attr: 'property', key: 'og:image:height', content: String(site.og.height) },
    { attr: 'property', key: 'og:image:alt', content: image.alt },
    { attr: 'name', key: 'twitter:card', content: 'summary_large_image' },
  ];

  return {
    title: title ? `${title} - ${site.name}` : site.name,
    description,
    canonical: noindex ? null : url,
    tags,
  };
}
