import { describe, expect, it } from 'vitest';
import { shareLinks } from '../src/lib/share';
import { site } from '../src/data/site';

const url = 'https://off-the-happy-path.vercel.app/log/the-time-we-didnt-save/';
const title = '“Q&A?” #1 № 002: the time we didn’t save';
const links = shareLinks(url, title);
const href = (id: string) => links.find((l) => l.id === id)!.href;
const encodedUrl = encodeURIComponent(url);
const encodedTitle = encodeURIComponent(title);

describe('shareLinks', () => {
  it('returns Email, LinkedIn, Bluesky and X in order, with labels from site.ts', () => {
    expect(links.map((l) => l.id)).toEqual(['email', 'linkedin', 'bluesky', 'x']);
    expect(links.map((l) => l.label)).toEqual(site.post.share.networks.map((n) => n.label));
    expect(links.map((l) => l.label)).toEqual(['Email', 'LinkedIn', 'Bluesky', 'X']);
  });

  it('builds a mailto with the title as subject and the URL as body', () => {
    expect(href('email')).toBe(`mailto:?subject=${encodedTitle}&body=${encodedUrl}`);
  });

  it('builds the LinkedIn share-offsite URL with the post URL only', () => {
    expect(href('linkedin')).toBe(`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`);
  });

  it('builds a Bluesky compose URL with the title, a space and the URL as one text', () => {
    expect(href('bluesky')).toBe(`https://bsky.app/intent/compose?text=${encodedTitle}%20${encodedUrl}`);
  });

  it('builds an X post intent with separate text and url', () => {
    expect(href('x')).toBe(`https://x.com/intent/post?text=${encodedTitle}&url=${encodedUrl}`);
  });

  it('encodes spaces as %20, never +', () => {
    for (const l of links) {
      expect(l.href).not.toContain('+');
      expect(l.href).not.toMatch(/ /);
    }
    expect(href('email')).toContain('the%20time%20we');
  });

  it('encodes the characters that would break a query: & ? # and curly quotes and №', () => {
    const query = (h: string) => h.slice(h.indexOf('?') + 1);
    for (const l of links) {
      const q = query(l.href);
      expect(q).not.toMatch(/[?#“”’№]/);
      // Only the separators between parameters are raw ampersands.
      expect(q.split('&').every((pair) => /^[a-z]+=[^=]*$/.test(pair))).toBe(true);
    }
  });

  it('round-trips the title and URL exactly as typed', () => {
    const params = (h: string) => new URLSearchParams(h.slice(h.indexOf('?') + 1));
    expect(params(href('email')).get('subject')).toBe(title);
    expect(params(href('email')).get('body')).toBe(url);
    expect(params(href('linkedin')).get('url')).toBe(url);
    expect(params(href('bluesky')).get('text')).toBe(`${title} ${url}`);
    expect(params(href('x')).get('text')).toBe(title);
    expect(params(href('x')).get('url')).toBe(url);
  });

  it('never puts the post URL unencoded inside another URL', () => {
    for (const l of links) {
      expect(l.href).not.toContain(url);
      expect(l.href).not.toContain('://off-the-happy-path');
      expect(l.href).toContain(encodedUrl);
    }
  });
});
