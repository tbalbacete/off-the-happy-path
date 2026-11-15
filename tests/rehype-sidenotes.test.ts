import { describe, expect, it } from 'vitest';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import { toHtml } from 'hast-util-to-html';
import type { Root } from 'hast';
import rehypeSidenotes from '../src/lib/rehype-sidenotes';

/** Markdown to hast the way Astro's unified pipeline does it. */
function hast(markdown: string): Root {
  const processor = unified().use(remarkParse).use(remarkGfm).use(remarkRehype);
  return processor.runSync(processor.parse(markdown)) as Root;
}

function render(markdown: string, withPlugin = true): string {
  const tree = hast(markdown);
  if (withPlugin) rehypeSidenotes()(tree);
  return toHtml(tree);
}

const count = (html: string, s: string) => html.split(s).length - 1;

describe('rehypeSidenotes', () => {
  it('adds one sidenote right after the reference and keeps the end notes', () => {
    const html = render('Points are estimated.[^1] Then built.\n\n[^1]: Points are a unit of mood.');
    expect(html).toContain(
      '</a></sup><span class="sidenote"><span class="sidenote__no">1</span> Points are a unit of mood.</span> Then built.</p>',
    );
    expect(html).toContain('<section data-footnotes class="footnotes">');
    expect(html).toContain('Points are a unit of mood. <a href="#user-content-fnref-1" data-footnote-backref');
  });

  it('numbers two notes in order, each in its own paragraph', () => {
    const html = render('One.[^a]\n\nTwo.[^b]\n\n[^a]: First.\n[^b]: Second.');
    expect(count(html, 'class="sidenote"')).toBe(2);
    expect(html).toMatch(/One\.<sup>.*?<\/sup><span class="sidenote"><span class="sidenote__no">1<\/span> First\.<\/span><\/p>/);
    expect(html).toMatch(/Two\.<sup>.*?<\/sup><span class="sidenote"><span class="sidenote__no">2<\/span> Second\.<\/span><\/p>/);
  });

  it('joins a two-paragraph note with <br> and drops the back-reference', () => {
    const html = render('Text.[^x]\n\n[^x]: First paragraph.\n\n    Second paragraph.');
    const note = /<span class="sidenote">(.*?)<\/span><\/p>/s.exec(html)?.[1];
    expect(note).toBe('<span class="sidenote__no">1</span> First paragraph.<br>Second paragraph.');
    expect(note).not.toContain('backref');
  });

  it('keeps inline code and links inside the note', () => {
    const html = render('Text.[^x]\n\n[^x]: Run `npm test` first, see [the docs](https://example.com).');
    expect(html).toContain(
      '<span class="sidenote"><span class="sidenote__no">1</span> Run <code>npm test</code> first, see <a href="https://example.com">the docs</a>.</span>',
    );
  });

  it('adds one sidenote for a note referenced twice, at the first reference', () => {
    const html = render('First.[^r] Again.[^r]\n\n[^r]: Shared.');
    expect(count(html, 'data-footnote-ref')).toBe(2);
    expect(count(html, 'class="sidenote"')).toBe(1);
    expect(html).toMatch(/First\.<sup>.*?<\/sup><span class="sidenote">.*?Shared\.<\/span> Again\.<sup>/);
    expect(html).not.toContain('<span class="sidenote__no">1</span> Shared. ');
  });

  it('leaves a post with no footnotes unchanged', () => {
    const md = '# Title\n\nPlain text with a [link](/x) and `code`.\n\n- a list';
    expect(render(md)).toBe(render(md, false));
  });

  it('does not change the end notes', () => {
    const md = 'One.[^a] Two.[^b]\n\n[^a]: First.\n\n    More.\n[^b]: Second `code`.';
    const section = (html: string) => html.slice(html.indexOf('<section'));
    expect(section(render(md))).toBe(section(render(md, false)));
  });

  it('copies the note rather than moving it', () => {
    const tree = hast('Text.[^x]\n\n[^x]: A [link](/y).');
    rehypeSidenotes()(tree);
    const html = toHtml(tree);
    expect(count(html, 'href="/y"')).toBe(2);
    expect(count(html, 'class="sidenote"')).toBe(1);
  });
});
