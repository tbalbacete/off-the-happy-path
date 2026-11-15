/**
 * A rehype plugin that copies each GFM footnote into a sidenote placed right
 * after its reference, in the same paragraph:
 *
 *   <sup><a data-footnote-ref href="#…fn-x">1</a></sup>
 *   <span class="sidenote"><span class="sidenote__no">1</span> The note.</span>
 *
 * The end-notes section stays. CSS shows exactly one copy: sidenotes in the
 * margin on wide screens, end notes on narrow ones. The hidden copy is
 * `display: none`, so screen readers only ever get one.
 *
 * Block content is flattened to phrasing content: paragraphs are joined with
 * `<br>`, other blocks become their text, and the back-reference link is
 * dropped. A note referenced more than once gets one sidenote, at its first
 * reference.
 */
import type { Element, ElementContent, Root, RootContent } from 'hast';

type Parent = Root | Element;

const isElement = (node: RootContent | Root | undefined, tagName?: string): node is Element =>
  node?.type === 'element' && (tagName === undefined || node.tagName === tagName);

const hasProp = (node: Element, prop: string): boolean =>
  node.properties[prop] !== undefined && node.properties[prop] !== false && node.properties[prop] !== null;

function walk(node: Parent, visit: (node: Element, parent: Parent) => void): void {
  for (const child of node.children) {
    if (child.type !== 'element') continue;
    visit(child, node);
    walk(child, visit);
  }
}

function textOf(node: ElementContent): string {
  if (node.type === 'text') return node.value;
  if (node.type === 'element') return node.children.map(textOf).join('');
  return '';
}

/** A copy of `nodes` without back-reference links, trimmed at the end. */
function withoutBackrefs(nodes: ElementContent[]): ElementContent[] {
  const out: ElementContent[] = [];
  for (const node of nodes) {
    if (node.type === 'element') {
      if (node.tagName === 'a' && hasProp(node, 'dataFootnoteBackref')) continue;
      out.push({ ...structuredClone({ ...node, children: [] }), children: withoutBackrefs(node.children) });
    } else {
      out.push(structuredClone(node));
    }
  }
  // Drop the spaces that sat before (and between) the back-references.
  for (let last = out.at(-1); last?.type === 'text'; last = out.at(-1)) {
    last.value = last.value.replace(/\s+$/, '');
    if (last.value !== '') break;
    out.pop();
  }
  return out;
}

/** A footnote's `li` content as phrasing content. */
function flatten(li: Element): ElementContent[] {
  const blocks = li.children.filter((n) => !(n.type === 'text' && n.value.trim() === ''));
  const parts: ElementContent[][] = [];
  for (const block of blocks) {
    if (block.type === 'element' && block.tagName === 'p') {
      parts.push(withoutBackrefs(block.children));
    } else if (block.type === 'element') {
      const text = textOf({ ...block, children: withoutBackrefs(block.children) }).trim();
      if (text) parts.push([{ type: 'text', value: text }]);
    } else if (block.type === 'text') {
      parts.push([{ type: 'text', value: block.value.trim() }]);
    }
  }
  const out: ElementContent[] = [];
  parts
    .filter((p) => p.length > 0)
    .forEach((part, i) => {
      if (i > 0) out.push({ type: 'element', tagName: 'br', properties: {}, children: [] });
      out.push(...part);
    });
  return out;
}

export default function rehypeSidenotes() {
  return (tree: Root): void => {
    // The end notes, by id.
    const notes = new Map<string, Element>();
    walk(tree, (node) => {
      if (isElement(node, 'section') && hasProp(node, 'dataFootnotes')) {
        walk(node, (li) => {
          if (isElement(li, 'li') && typeof li.properties.id === 'string') notes.set(li.properties.id, li);
        });
      }
    });
    if (notes.size === 0) return;

    // Each first reference to a note, with where to put its sidenote.
    const inserts: { parent: Parent; sup: Element; sidenote: Element }[] = [];
    const seen = new Set<string>();
    walk(tree, (node, parent) => {
      if (!isElement(node, 'sup')) return;
      const ref = node.children.find((c): c is Element => isElement(c, 'a') && hasProp(c, 'dataFootnoteRef'));
      const href = ref?.properties.href;
      if (!ref || typeof href !== 'string' || !href.startsWith('#')) return;
      const id = decodeURIComponent(href.slice(1));
      const li = notes.get(id);
      if (!li || seen.has(id)) return;
      seen.add(id);
      inserts.push({
        parent,
        sup: node,
        sidenote: {
          type: 'element',
          tagName: 'span',
          properties: { className: ['sidenote'] },
          children: [
            {
              type: 'element',
              tagName: 'span',
              properties: { className: ['sidenote__no'] },
              children: [{ type: 'text', value: textOf(ref).trim() }],
            },
            { type: 'text', value: ' ' },
            ...flatten(li),
          ],
        },
      });
    });

    for (const { parent, sup, sidenote } of inserts) {
      const index = parent.children.indexOf(sup);
      parent.children.splice(index + 1, 0, sidenote);
    }
  };
}
