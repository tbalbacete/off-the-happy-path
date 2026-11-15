/**
 * Post HTML for the RSS feed. Feed readers ignore the site's CSS, so the
 * sidenote copies (which CSS hides on narrow screens) would repeat every
 * note; they are removed and the end notes kept. Root-relative links and
 * images are made absolute, since a feed item has no base URL.
 */
import { unified } from 'unified';
import rehypeParse from 'rehype-parse';
import rehypeStringify from 'rehype-stringify';
import type { Element, Root } from 'hast';

type Parent = Root | Element;

const URL_PROPS = ['href', 'src'] as const;

function isSidenote(node: Element): boolean {
  const cls = node.properties.className;
  return node.tagName === 'span' && Array.isArray(cls) && cls.includes('sidenote');
}

function clean(node: Parent, base: URL): void {
  node.children = node.children.filter((child) => !(child.type === 'element' && isSidenote(child)));
  for (const child of node.children) {
    if (child.type !== 'element') continue;
    for (const prop of URL_PROPS) {
      const value = child.properties[prop];
      if (typeof value === 'string' && value.startsWith('/') && !value.startsWith('//')) {
        child.properties[prop] = new URL(value, base).href;
      }
    }
    clean(child, base);
  }
}

/** A post's rendered HTML, ready for a feed item's `content`. */
export function feedHtml(html: string, siteUrl: string | URL): string {
  const processor = unified().use(rehypeParse, { fragment: true }).use(rehypeStringify);
  const tree = processor.parse(html);
  clean(tree, new URL(siteUrl));
  return processor.stringify(tree);
}
