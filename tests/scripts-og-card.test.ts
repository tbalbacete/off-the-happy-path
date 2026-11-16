import { describe, expect, it } from 'vitest';
import {
  cardPostFrom,
  entryLabel,
  escapeHtml,
  ogCardHtml,
  stampClass,
  titleSize,
  type CardPost,
} from '../scripts/lib/og-card.mjs';
import { cardPath, chromePath, DEFAULT_CHROME_PATH } from '../scripts/lib/og-render.mjs';

const post: CardPost = {
  no: 2,
  title: 'The time we didn’t save',
  dek: 'We rarely make time to work out what a ticket means.',
  type: 'rant',
  date: '2026-11-15',
  slug: 'the-time-we-didnt-save',
};

describe('titleSize', () => {
  it('steps down as titles get longer', () => {
    expect(titleSize('x'.repeat(1))).toBe(112);
    expect(titleSize('x'.repeat(22))).toBe(112);
    expect(titleSize('x'.repeat(23))).toBe(92);
    expect(titleSize('x'.repeat(40))).toBe(92);
    expect(titleSize('x'.repeat(41))).toBe(76);
    expect(titleSize('x'.repeat(60))).toBe(76);
    expect(titleSize('x'.repeat(61))).toBe(62);
    expect(titleSize('x'.repeat(90))).toBe(62);
    expect(titleSize('x'.repeat(91))).toBe(52);
    expect(titleSize('x'.repeat(105))).toBe(52);
    expect(titleSize('x'.repeat(106))).toBe(44);
    expect(titleSize('x'.repeat(300))).toBe(44);
  });

  it('counts characters, not UTF-16 units', () => {
    expect(titleSize('№'.repeat(22))).toBe(112);
    expect(titleSize('𝔁'.repeat(22))).toBe(112);
  });

  it('sizes the published titles', () => {
    expect(titleSize('Hello, log')).toBe(112);
    expect(titleSize(post.title)).toBe(92);
  });
});

describe('stampClass', () => {
  it('puts RANT in pen and the other types in ink', () => {
    expect(stampClass('rant')).toBe('stamp stamp--pen');
    expect(stampClass('essay')).toBe('stamp');
    expect(stampClass('note')).toBe('stamp');
  });
});

describe('escapeHtml', () => {
  it('escapes the five HTML characters and leaves curly quotes alone', () => {
    expect(escapeHtml(`<b>"Q&A" it's</b>`)).toBe('&lt;b&gt;&quot;Q&amp;A&quot; it&#39;s&lt;/b&gt;');
    expect(escapeHtml('“didn’t” № 002')).toBe('“didn’t” № 002');
  });
});

describe('entryLabel', () => {
  it('pads to three digits', () => {
    expect(entryLabel(2)).toBe('№ 002');
    expect(entryLabel(123)).toBe('№ 123');
  });
});

describe('ogCardHtml', () => {
  const html = ogCardHtml(post);

  it('has the kicker, title, dek and path', () => {
    expect(html).toContain('Off the Happy Path');
    expect(html).toContain('№ 002');
    expect(html).toContain('<span class="stamp stamp--pen">rant</span>');
    expect(html).toContain('Filed 2026-11-15');
    expect(html).toContain('style="font-size: 92px">The time we didn’t save</h1>');
    expect(html).toContain('<p class="dek">We rarely make time to work out what a ticket means.</p>');
    expect(html).toContain('/log/the-time-we-didnt-save/</div>');
  });

  it('uses an ink stamp for notes and essays', () => {
    expect(ogCardHtml({ ...post, type: 'note' })).toContain('<span class="stamp">note</span>');
  });

  it('escapes the title and dek', () => {
    const evil = ogCardHtml({ ...post, title: '<script>alert(1)</script> & co', dek: '"quoted" <em>dek</em>' });
    expect(evil).not.toContain('<script>');
    expect(evil).not.toContain('<em>');
    expect(evil).toContain('&lt;script&gt;alert(1)&lt;/script&gt; &amp; co');
    expect(evil).toContain('&quot;quoted&quot; &lt;em&gt;dek&lt;/em&gt;');
  });

  it('loads the three fonts from node_modules relative to design/, and nothing remote', () => {
    expect(html).toContain("url('../node_modules/@fontsource-variable/archivo/");
    expect(html).toContain("url('../node_modules/@fontsource-variable/source-serif-4/");
    expect(html).toContain("url('../node_modules/@fontsource/ibm-plex-mono/");
    expect(html).not.toMatch(/https?:\/\//);
  });

  it('uses only the token colors, and no radius, shadow or gradient', () => {
    const hexes = new Set(html.match(/#[0-9a-f]{3,6}\b/gi));
    expect([...hexes].sort()).toEqual(['#111111', '#55534d', '#b3190f', '#f2f2ee']);
    expect(html).not.toMatch(/border-radius|box-shadow|text-shadow|gradient|#ffe14d/);
  });
});

describe('cardPostFrom', () => {
  it('reads the card fields from frontmatter', () => {
    const data = { no: 2, title: post.title, dek: post.dek, type: 'rant', date: '2026-11-15', draft: false };
    expect(cardPostFrom({ file: '002-x.md', slug: post.slug, data })).toEqual(post);
  });

  it('names the file when a field is missing or wrong', () => {
    expect(() => cardPostFrom({ file: '003-x.md', slug: 'x', data: { no: 3, title: 'T', dek: 'D', type: 'poem', date: '2026-01-01' } })).toThrow(
      /003-x\.md needs no, title, dek, type and date/,
    );
    expect(() => cardPostFrom({ file: '004-x.md', slug: 'x', data: { title: 'T' } })).toThrow(/004-x\.md/);
  });
});

describe('og-render helpers', () => {
  it('defaults to the macOS Chrome and honours CHROME_PATH', () => {
    expect(chromePath({})).toBe(DEFAULT_CHROME_PATH);
    expect(chromePath({ CHROME_PATH: '/opt/chrome' })).toBe('/opt/chrome');
  });

  it('puts cards in public/og', () => {
    expect(cardPath('hello-log')).toBe('public/og/hello-log.png');
  });
});
