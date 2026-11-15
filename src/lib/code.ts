/**
 * Code blocks in posts: the Shiki theme, and the transformers that box a
 * fence and mark its highlighted lines. Registered in astro.config.mjs.
 */
import type { Element, ElementContent } from 'hast';
import { createCssVariablesTheme, type ShikiTransformer } from 'shiki';
import { transformerMetaHighlight } from '@shikijs/transformers';

export interface CodeMeta {
  /** Shown on the left of the caption bar, e.g. `TICKET-4127.md`. */
  title?: string;
  /** Shown on the right of the caption bar, e.g. `As written`. */
  note?: string;
}

/**
 * Read `title="…"` and `note="…"` from a fence's meta string. Either quote
 * type works, so the other one can appear inside. Line ranges such as `{3}`
 * are left for transformerMetaHighlight.
 */
export function parseCodeMeta(raw: string | undefined): CodeMeta {
  const meta: CodeMeta = {};
  if (!raw) return meta;
  for (const m of raw.matchAll(/(?:^|\s)(title|note)=(?:"([^"]*)"|'([^']*)')/g)) {
    const key = m[1] as keyof CodeMeta;
    const value = m[2] ?? m[3];
    if (meta[key] === undefined && value.trim() !== '') meta[key] = value.trim();
  }
  return meta;
}

/**
 * Every color is a CSS variable (`--code-*`), mapped to the five tokens in
 * global.css, so no hex value lives outside the token block.
 */
export const codeTheme = createCssVariablesTheme({
  name: 'off-the-happy-path',
  variablePrefix: '--code-',
  variableDefaults: {},
  fontStyle: false,
});

const span = (className: string, text: string): Element => ({
  type: 'element',
  tagName: 'span',
  properties: { className: [className] },
  children: [{ type: 'text', value: text }],
});

/**
 * Wrap every highlighted block in a `figure.code-box`. A fence with a title
 * also gets a `figcaption` bar holding the title and the optional note.
 */
export function transformerCodeFigure(): ShikiTransformer {
  return {
    name: 'off-the-happy-path:code-figure',
    root(root) {
      const pre = root.children.find((n): n is Element => n.type === 'element' && n.tagName === 'pre');
      if (!pre) return;
      const { title, note } = parseCodeMeta(this.options.meta?.__raw);
      const children: ElementContent[] = [];
      if (title) {
        const caption: Element = {
          type: 'element',
          tagName: 'figcaption',
          properties: { className: ['code-box__caption'] },
          children: [span('code-box__title', title)],
        };
        if (note) caption.children.push(span('code-box__note', note));
        children.push(caption);
      }
      children.push(pre);
      root.children = [
        { type: 'element', tagName: 'figure', properties: { className: ['code-box'] }, children },
      ];
    },
  };
}

/** The transformers posts use, in order. */
export function codeTransformers(): ShikiTransformer[] {
  return [transformerMetaHighlight({ className: 'highlighted' }), transformerCodeFigure()];
}
