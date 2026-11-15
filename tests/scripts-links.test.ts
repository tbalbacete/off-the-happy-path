import { describe, expect, it } from 'vitest';
import { candidateFiles, extractHrefs, findBrokenLinks, isInternal, pagePath } from '../scripts/lib/links.mjs';

describe('extractHrefs', () => {
  it('collects hrefs from links, nav and head in document order', () => {
    const html =
      '<!doctype html><html><head><link rel="canonical" href="https://x.test/a/"><link rel="alternate" href="/rss.xml"></head>' +
      '<body><nav><a href="/">Home</a><a href=\'/type/note/\'>Notes</a></nav><p><a href="#fn-1">1</a></p></body></html>';
    expect(extractHrefs(html)).toEqual(['https://x.test/a/', '/rss.xml', '/', '/type/note/', '#fn-1']);
  });
  it('ignores anchors with no href and hrefs inside text', () => {
    expect(extractHrefs('<a name="x">x</a><p>href="/nope/"</p><!-- <a href="/c/"> -->')).toEqual([]);
  });
});

describe('isInternal', () => {
  it('counts root-relative and relative paths', () => {
    for (const h of ['/', '/archive/', '/rss.xml', '../hello-log/', 'about/', '/tag/ai/#top', '/a/?q=1']) {
      expect(isInternal(h), h).toBe(true);
    }
  });
  it('skips external URLs, mailto, tel, protocol-relative and in-page anchors', () => {
    for (const h of ['https://github.com/x', 'http://a.b', 'mailto:me@x.test?subject=Re', 'tel:123', '//cdn.x/y', '#about', '']) {
      expect(isInternal(h), h).toBe(false);
    }
  });
});

describe('pagePath', () => {
  it('maps built files to the paths they are served at', () => {
    expect(pagePath('index.html')).toBe('/');
    expect(pagePath('about/index.html')).toBe('/about/');
    expect(pagePath('log/hello-log/index.html')).toBe('/log/hello-log/');
    expect(pagePath('404.html')).toBe('/404.html');
  });
});

describe('candidateFiles', () => {
  it('maps a directory path to its index.html', () => {
    expect(candidateFiles('/')).toEqual(['index.html']);
    expect(candidateFiles('/tag/ai/')).toEqual(['tag/ai/index.html']);
  });
  it('tries the file, then .html, then a folder index for other paths', () => {
    expect(candidateFiles('/rss.xml')).toEqual(['rss.xml', 'rss.xml.html', 'rss.xml/index.html']);
    expect(candidateFiles('/archive')).toEqual(['archive', 'archive.html', 'archive/index.html']);
  });
});

describe('findBrokenLinks', () => {
  const files = new Set([
    'index.html',
    'archive/index.html',
    'log/hello-log/index.html',
    'tag/meta/index.html',
    'rss.xml',
    'og.png',
    '404.html',
  ]);

  it('passes when every internal link resolves', () => {
    const pages = new Map([
      ['index.html', '<a href="/archive/">a</a><a href="/rss.xml">r</a><a href="/tag/meta/">t</a><a href="/archive">no slash</a>'],
      ['log/hello-log/index.html', '<a href="../../archive/">up</a><a href="/#about">home</a><a href="/archive/?x=1#y">q</a>'],
    ]);
    expect(findBrokenLinks(pages, files)).toEqual([]);
  });

  it('lists each link that does not resolve, with its page', () => {
    const pages = new Map([
      ['index.html', '<a href="/tag/ai/">ai</a><a href="/archive/">ok</a>'],
      ['404.html', '<a href="/missing.xml">feed</a>'],
    ]);
    expect(findBrokenLinks(pages, files)).toEqual([
      { page: 'index.html', href: '/tag/ai/' },
      { page: '404.html', href: '/missing.xml' },
    ]);
  });

  it('resolves relative links against the page they are on', () => {
    const pages = new Map([['log/hello-log/index.html', '<a href="other/">x</a>']]);
    expect(findBrokenLinks(pages, files)).toEqual([{ page: 'log/hello-log/index.html', href: 'other/' }]);
  });

  it('decodes percent-encoded paths', () => {
    const withUnicode = new Set([...files, 'tag/café/index.html']);
    const pages = new Map([['index.html', '<a href="/tag/caf%C3%A9/">c</a>']]);
    expect(findBrokenLinks(pages, withUnicode)).toEqual([]);
  });

  it('skips external, mailto and in-page links', () => {
    const pages = new Map([
      ['index.html', '<a href="https://github.com/x">g</a><a href="mailto:a@b.c">m</a><a href="#nope">n</a>'],
    ]);
    expect(findBrokenLinks(pages, files)).toEqual([]);
  });
});
