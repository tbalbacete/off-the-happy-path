/**
 * Post HTML for the RSS feed. Feed readers ignore the site's CSS, so the
 * sidenote copies (which CSS hides on narrow screens) would repeat every
 * note; they are removed and the end notes kept. A feed item has no base
 * URL, so root-relative links and images, and in-page `#` links such as the
 * footnote references, are made absolute against the post's URL. `style`
 * attributes are dropped: they only carry the code box's `var(--code-*)`
 * colors, which mean nothing without the site's stylesheet.
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

/** Root-relative (`/log/…`) or in-page (`#fn-1`); not protocol-relative (`//cdn…`). */
function isRelative(value: string): boolean {
  return value.startsWith('#') || (value.startsWith('/') && !value.startsWith('//'));
}

function clean(node: Parent, base: URL): void {
  node.children = node.children.filter((child) => !(child.type === 'element' && isSidenote(child)));
  for (const child of node.children) {
    if (child.type !== 'element') continue;
    delete child.properties.style;
    for (const prop of URL_PROPS) {
      const value = child.properties[prop];
      if (typeof value === 'string' && isRelative(value)) child.properties[prop] = new URL(value, base).href;
    }
    clean(child, base);
  }
}

/**
 * A post's rendered HTML, ready for a feed item's `content`. `postUrl` is the
 * post's absolute URL, such as `https://off-the-happy-path.vercel.app/log/hello-log/`.
 */
export function feedHtml(html: string, postUrl: string | URL): string {
  const processor = unified().use(rehypeParse, { fragment: true }).use(rehypeStringify);
  const tree = processor.parse(html);
  clean(tree, new URL(postUrl));
  return processor.stringify(tree);
}
