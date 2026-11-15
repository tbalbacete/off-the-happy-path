// @ts-check
/**
 * The internal link check behind `npm run links`: every internal `href` in
 * the built HTML must resolve to a file in `dist`. Pure, so the CLI only
 * reads files and prints.
 */
import { unified } from 'unified';
import rehypeParse from 'rehype-parse';

/** @typedef {import('hast').Root} Root */
/** @typedef {import('hast').Element} Element */
/** @typedef {{ page: string, href: string }} BrokenLink */

const parser = unified().use(rehypeParse);

/**
 * Every `href` on an element in the page, in document order.
 * @param {string} html
 * @returns {string[]}
 */
export function extractHrefs(html) {
  /** @type {string[]} */
  const hrefs = [];
  /** @param {Root | Element} node */
  const walk = (node) => {
    for (const child of node.children) {
      if (child.type !== 'element') continue;
      const href = child.properties.href;
      if (typeof href === 'string') hrefs.push(href);
      walk(child);
      // <template> content lives on its own root.
      if (child.content) walk(child.content);
    }
  };
  walk(/** @type {Root} */ (parser.parse(html)));
  return hrefs;
}

/**
 * Whether a link points inside the site: a path, not a URL with a scheme
 * (`https:`, `mailto:`), not protocol-relative, and not an in-page `#` anchor.
 * @param {string} href
 */
export function isInternal(href) {
  const h = href.trim();
  if (h === '' || h.startsWith('#') || h.startsWith('//')) return false;
  return !/^[a-z][a-z0-9+.-]*:/i.test(h);
}

/**
 * The URL path a built file is served at: `about/index.html` -> `/about/`,
 * `404.html` -> `/404.html`, `index.html` -> `/`.
 * @param {string} file a path relative to `dist`, with `/` separators
 */
export function pagePath(file) {
  const path = `/${file}`;
  return path.endsWith('/index.html') ? path.slice(0, -'index.html'.length) : path;
}

/**
 * The `dist`-relative files that could serve a URL path: `/about/` ->
 * `about/index.html`; `/rss.xml` -> `rss.xml`, `rss.xml.html`, `rss.xml/index.html`.
 * @param {string} pathname
 * @returns {string[]}
 */
export function candidateFiles(pathname) {
  const p = pathname.replace(/^\/+/, '');
  if (p === '' || p.endsWith('/')) return [`${p}index.html`];
  return [p, `${p}.html`, `${p}/index.html`];
}

/**
 * Internal links on built pages that don't resolve to a built file.
 * @param {Map<string, string>} pages `dist`-relative HTML file -> its HTML
 * @param {Set<string>} files every `dist`-relative file
 * @returns {BrokenLink[]}
 */
export function findBrokenLinks(pages, files) {
  /** @type {BrokenLink[]} */
  const broken = [];
  for (const [file, html] of pages) {
    const base = new URL(pagePath(file), 'http://site.invalid');
    for (const href of extractHrefs(html)) {
      if (!isInternal(href)) continue;
      const pathname = decodeURIComponent(new URL(href, base).pathname);
      if (!candidateFiles(pathname).some((f) => files.has(f))) broken.push({ page: file, href });
    }
  }
  return broken;
}
