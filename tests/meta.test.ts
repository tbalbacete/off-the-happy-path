import { describe, expect, it } from 'vitest';
import { pageMeta, withTrailingSlash, type MetaTag } from '../src/lib/meta';
import { site } from '../src/data/site';

const origin = 'https://off-the-happy-path.vercel.app';
const get = (tags: MetaTag[], key: string) => tags.find((t) => t.key === key)?.content;

describe('withTrailingSlash', () => {
  it('adds a missing slash and leaves one that is there', () => {
    expect(withTrailingSlash('/archive')).toBe('/archive/');
    expect(withTrailingSlash('/archive/')).toBe('/archive/');
    expect(withTrailingSlash('/')).toBe('/');
  });
});

describe('pageMeta', () => {
  it('uses the site name and tagline on the home page', () => {
    const meta = pageMeta({ path: '/', origin });
    expect(meta.title).toBe(site.name);
    expect(meta.description).toBe(site.tagline);
    expect(meta.canonical).toBe(`${origin}/`);
    expect(get(meta.tags, 'og:title')).toBe(site.name);
    expect(get(meta.tags, 'og:type')).toBe('website');
  });

  it('builds a post page title, description and article type', () => {
    const meta = pageMeta({
      title: 'Nobody reads the ticket',
      description: 'A dek.',
      path: '/log/nobody-reads-the-ticket/',
      type: 'article',
      origin,
    });
    expect(meta.title).toBe(`Nobody reads the ticket - ${site.name}`);
    expect(meta.description).toBe('A dek.');
    expect(get(meta.tags, 'description')).toBe('A dek.');
    expect(get(meta.tags, 'og:title')).toBe('Nobody reads the ticket');
    expect(get(meta.tags, 'og:description')).toBe('A dek.');
    expect(get(meta.tags, 'og:type')).toBe('article');
    expect(get(meta.tags, 'og:url')).toBe(`${origin}/log/nobody-reads-the-ticket/`);
  });

  it('makes the canonical URL absolute with a trailing slash', () => {
    expect(pageMeta({ path: '/archive', origin }).canonical).toBe(`${origin}/archive/`);
    expect(pageMeta({ path: '/tag/ai/', origin: new URL(origin) }).canonical).toBe(`${origin}/tag/ai/`);
  });

  it('points og:image at the absolute OG image with its size and alt text', () => {
    const { tags } = pageMeta({ path: '/', origin });
    expect(get(tags, 'og:image')).toBe(`${origin}/og.png`);
    expect(get(tags, 'og:image:width')).toBe('1200');
    expect(get(tags, 'og:image:height')).toBe('630');
    expect(get(tags, 'og:image:alt')).toBe(site.og.alt);
    expect(get(tags, 'og:site_name')).toBe(site.name);
    expect(get(tags, 'twitter:card')).toBe('summary_large_image');
  });

  it('uses property for Open Graph tags and name for the rest', () => {
    for (const tag of pageMeta({ path: '/', origin }).tags) {
      expect(tag.attr).toBe(tag.key.startsWith('og:') ? 'property' : 'name');
    }
  });

  it('adds noindex and drops the canonical on noindex pages', () => {
    const meta = pageMeta({ title: 'Not found', path: '/404', origin, noindex: true });
    expect(meta.canonical).toBeNull();
    expect(get(meta.tags, 'robots')).toBe('noindex');
  });

  it('has no robots tag on normal pages', () => {
    expect(get(pageMeta({ path: '/', origin }).tags, 'robots')).toBeUndefined();
  });
});
