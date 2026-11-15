import { describe, expect, it } from 'vitest';
import { feedHtml } from '../src/lib/feed';

const site = 'https://off-the-happy-path.vercel.app';
const post = `${site}/log/the-time-we-didnt-save/`;

describe('feedHtml', () => {
  it('removes the sidenote copies and keeps the end notes', () => {
    const html =
      '<p>Text.<sup><a href="#user-content-fn-1" id="user-content-fnref-1" data-footnote-ref="">1</a></sup>' +
      '<span class="sidenote"><span class="sidenote__no">1</span> The note.</span> More.</p>' +
      '<section data-footnotes="" class="footnotes"><ol><li id="user-content-fn-1"><p>The note. ' +
      '<a href="#user-content-fnref-1" data-footnote-backref="">↩</a></p></li></ol></section>';
    const out = feedHtml(html, post);
    expect(out).not.toContain('class="sidenote"');
    expect(out).not.toContain('sidenote__no');
    expect(out).toContain('</sup> More.</p>');
    expect(out).toContain('<section data-footnotes="" class="footnotes">');
    expect(out).toContain('<li id="user-content-fn-1"><p>The note.');
    expect(out.match(/The note\./g)).toHaveLength(1);
  });

  it('points footnote references and back-links at the post', () => {
    const html =
      '<p>A<sup><a href="#user-content-fn-1" id="user-content-fnref-1">1</a></sup></p>' +
      '<ol><li id="user-content-fn-1"><a href="#user-content-fnref-1">↩</a></li></ol>';
    const out = feedHtml(html, post);
    expect(out).toContain(`<a href="${post}#user-content-fn-1" id="user-content-fnref-1">1</a>`);
    expect(out).toContain(`<a href="${post}#user-content-fnref-1">↩</a>`);
    expect(out).not.toMatch(/href="#/);
  });

  it('removes every sidenote, not just the first', () => {
    const html = '<p>A<span class="sidenote">one</span></p><p>B<span class="sidenote extra">two</span></p>';
    expect(feedHtml(html, post)).toBe('<p>A</p><p>B</p>');
  });

  it('keeps a code box but drops its inline styles', () => {
    const html =
      '<figure class="code-box"><figcaption class="code-box__bar"><span>TICKET-4127.md</span></figcaption>' +
      '<pre class="astro-code" style="background-color:var(--code-background);color:var(--code-foreground); overflow-x: auto;" tabindex="0">' +
      '<code><span class="line highlighted"><span style="color:var(--code-foreground)">&#x3C;div></span></span></code></pre></figure>';
    const out = feedHtml(html, post);
    expect(out).toContain('<figure class="code-box">');
    expect(out).toContain('<pre class="astro-code" tabindex="0">');
    expect(out).toContain('<span class="line highlighted"><span>&#x3C;div></span></span>');
    expect(out).not.toContain('style=');
  });

  it('makes root-relative links and images absolute on the site origin', () => {
    const html = '<p><a href="/log/hello-log/">Hello</a> <img src="/img/a.png" alt="A"></p>';
    expect(feedHtml(html, post)).toBe(
      `<p><a href="${site}/log/hello-log/">Hello</a> <img src="${site}/img/a.png" alt="A"></p>`,
    );
  });

  it('leaves absolute, protocol-relative and mailto links alone', () => {
    const html =
      '<p><a href="https://example.com/x">x</a> <a href="//cdn.example.com/y">y</a> <a href="mailto:a@b.c">m</a></p>';
    expect(feedHtml(html, post)).toBe(html);
  });

  it('accepts the post URL as a URL object', () => {
    expect(feedHtml('<a href="#top">a</a>', new URL(post))).toBe(`<a href="${post}#top">a</a>`);
  });

  it('leaves a post with no notes, styles or relative links unchanged apart from serialisation', () => {
    const html = '<h2 id="why">Why</h2>\n<p>Plain <em>text</em> with <mark>a mark</mark>.</p>\n<ul>\n<li>One</li>\n</ul>';
    expect(feedHtml(html, post)).toBe(html);
  });
});
