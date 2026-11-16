import { describe, expect, it } from 'vitest';
import { postCardAlt, postCardPath, postOgImage } from '../src/lib/og';
import { site } from '../src/data/site';

const base = { slug: 'the-time-we-didnt-save', no: 2, title: 'The time we didn’t save', draft: false };

describe('postCardPath and postCardAlt', () => {
  it('names the card after the slug', () => {
    expect(postCardPath('hello-log')).toBe('/og/hello-log.png');
  });

  it('labels it with the entry number and the title as typed', () => {
    expect(postCardAlt(2, 'The time we didn’t save')).toBe('№ 002: The time we didn’t save');
  });
});

describe('postOgImage', () => {
  it('uses the post card when it exists, in production and dev', () => {
    for (const production of [true, false]) {
      expect(postOgImage({ ...base, hasCard: true, production })).toEqual({
        path: '/og/the-time-we-didnt-save.png',
        alt: '№ 002: The time we didn’t save',
      });
    }
  });

  it('fails a production build for a published post with no card, naming the fix', () => {
    expect(() => postOgImage({ ...base, hasCard: false, production: true })).toThrow(
      /№ 002 \(the-time-we-didnt-save\) is published but has no Open Graph card at public\/og\/the-time-we-didnt-save\.png\. Run `npm run og -- 2`/,
    );
  });

  it('falls back to the shared image for drafts, and for anything in dev', () => {
    const shared = { path: site.og.image, alt: site.og.alt };
    expect(postOgImage({ ...base, draft: true, hasCard: false, production: true })).toEqual(shared);
    expect(postOgImage({ ...base, draft: true, hasCard: false, production: false })).toEqual(shared);
    expect(postOgImage({ ...base, hasCard: false, production: false })).toEqual(shared);
  });
});
