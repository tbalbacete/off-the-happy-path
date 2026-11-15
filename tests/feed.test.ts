import { describe, expect, it } from 'vitest';
import { feedHtml } from '../src/lib/feed';

const site = 'https://off-the-happy-path.vercel.app';

describe('feedHtml', () => {
  it('removes the sidenote copies and keeps the end notes', () => {
    const html =
      '<p>Text.<sup><a href="#user-content-fn-1" id="user-content-fnref-1" data-footnote-ref="">1</a></sup>' +
      '<span class="sidenote"><span class="sidenote__no">1</span> The note.</span> More.</p>' +
      '<section data-footnotes="" class="footnotes"><ol><li id="user-content-fn-1"><p>The note. ' +
      '<a href="#user-content-fnref-1" data-footnote-backref="">↩</a></p></li></ol></section>';
    const out = feedHtml(html, site);
    expect(out).not.toContain('class="sidenote"');
    expect(out).not.toContain('sidenote__no');
    expect(out).toContain('<p>Text.<sup><a href="#user-content-fn-1"');
    expect(out).toContain('</sup> More.</p>');
    expect(out).toContain('<section data-footnotes="" class="footnotes">');
    expect(out).toContain('<li id="user-content-fn-1"><p>The note.');
    expect(out.match(/The note\./g)).toHaveLength(1);
  });

  it('removes every sidenote, not just the first', () => {
    const html =
      '<p>A<span class="sidenote">one</span></p><p>B<span class="sidenote extra">two</span></p>';
    expect(feedHtml(html, site)).toBe('<p>A</p><p>B</p>');
  });

  it('keeps a code box as it is', () => {
    const html =
      '<figure class="code-box"><figcaption class="code-box__bar"><span>TICKET-4127.md</span></figcaption>' +
      '<pre class="astro-code" tabindex="0"><code><span class="line highlighted">' +
      '<span style="color:var(--code-foreground)">&#x3C;div></span></span></code></pre></figure>';
    const out = feedHtml(html, site);
    expect(out).toContain('<figure class="code-box">');
    expect(out).toContain('<span style="color:var(--code-foreground)">&#x3C;div></span>');
    expect(out).toContain('<span class="line highlighted">');
  });

  it('makes root-relative links and images absolute', () => {
    const html = '<p><a href="/log/hello-log/">Hello</a> <img src="/img/a.png" alt="A"></p>';
    expect(feedHtml(html, site)).toBe(
      `<p><a href="${site}/log/hello-log/">Hello</a> <img src="${site}/img/a.png" alt="A"></p>`,
    );
  });

  it('leaves absolute, protocol-relative, mailto and in-page links alone', () => {
    const html =
      '<p><a href="https://example.com/x">x</a> <a href="//cdn.example.com/y">y</a> ' +
      '<a href="mailto:a@b.c">m</a> <a href="#user-content-fn-1">1</a></p>';
    expect(feedHtml(html, site)).toBe(html);
  });

  it('accepts the site as a URL', () => {
    expect(feedHtml('<a href="/archive/">a</a>', new URL(site))).toBe(`<a href="${site}/archive/">a</a>`);
  });

  it('leaves a post with no notes unchanged apart from serialisation', () => {
    const html = '<h2 id="why">Why</h2>\n<p>Plain <em>text</em> with <mark>a mark</mark>.</p>\n<ul>\n<li>One</li>\n</ul>';
    expect(feedHtml(html, site)).toBe(html);
  });
});
