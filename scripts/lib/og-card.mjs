// @ts-check
/**
 * The HTML for a post's Open Graph card (1200x630), screenshotted by
 * `npm run og` into `public/og/<slug>.png`. It follows the shared card in
 * design/og.html: paper, a 2px ink frame, left-aligned, the site's three
 * fonts loaded from node_modules by a path relative to design/, so the
 * renderer opens a page in design/ before setting this HTML.
 *
 * Five colors only (docs/plan.md §6), no highlighter on the card.
 */

/**
 * @typedef {object} CardPost
 * @property {number} no
 * @property {string} title  As typed in the frontmatter (curly quotes kept).
 * @property {string} dek
 * @property {'essay' | 'note' | 'rant'} type
 * @property {string} date  `YYYY-MM-DD`
 * @property {string} slug
 */

export const CARD_WIDTH = 1200;
export const CARD_HEIGHT = 630;

const SITE_NAME = 'Off the Happy Path';
const FONTS = '../node_modules';

/**
 * Title font size in px, by length, in fixed steps. Checked in Chrome with
 * wide-letter padding: up to 150 characters stays within three lines of the
 * 1008px column; longer titles still fit the card, on four.
 *
 * @param {string} title
 * @returns {number}
 */
export function titleSize(title) {
  const n = [...title].length;
  if (n <= 22) return 112;
  if (n <= 40) return 92;
  if (n <= 60) return 76;
  if (n <= 90) return 62;
  if (n <= 105) return 52;
  return 44;
}

/**
 * The stamp's class: RANT in pen, the other types in ink, as on the site.
 *
 * @param {CardPost['type']} type
 */
export function stampClass(type) {
  return type === 'rant' ? 'stamp stamp--pen' : 'stamp';
}

/**
 * Escape text for HTML content and attribute values.
 *
 * @param {string} text
 */
export function escapeHtml(text) {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

/** `2` -> `№ 002`. @param {number} no */
export function entryLabel(no) {
  return `№ ${String(no).padStart(3, '0')}`;
}

/**
 * The card's full HTML document.
 *
 * @param {CardPost} post
 * @returns {string}
 */
export function ogCardHtml(post) {
  const e = escapeHtml;
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>${e(post.title)}</title>
    <style>
      @font-face {
        font-family: 'Archivo Variable';
        font-style: normal;
        font-weight: 100 900;
        font-stretch: 62% 125%;
        src: url('${FONTS}/@fontsource-variable/archivo/files/archivo-latin-wdth-normal.woff2') format('woff2-variations');
      }
      @font-face {
        font-family: 'Source Serif 4 Variable';
        font-style: italic;
        font-weight: 200 900;
        src: url('${FONTS}/@fontsource-variable/source-serif-4/files/source-serif-4-latin-wght-italic.woff2') format('woff2-variations');
      }
      @font-face {
        font-family: 'IBM Plex Mono';
        font-style: normal;
        font-weight: 500;
        src: url('${FONTS}/@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-500-normal.woff2') format('woff2');
      }
      /* № lives in Plex Mono's cyrillic subset. */
      @font-face {
        font-family: 'IBM Plex Mono';
        font-style: normal;
        font-weight: 500;
        src: url('${FONTS}/@fontsource/ibm-plex-mono/files/ibm-plex-mono-cyrillic-500-normal.woff2') format('woff2');
        unicode-range: U+2116;
      }
      :root {
        --paper: #f2f2ee;
        --ink: #111111;
        --pencil: #55534d;
        --pen: #b3190f;
      }
      * {
        box-sizing: border-box;
      }
      html,
      body {
        margin: 0;
        width: ${CARD_WIDTH}px;
        height: ${CARD_HEIGHT}px;
        overflow: hidden;
        background: var(--paper);
        color: var(--ink);
      }
      .frame {
        position: absolute;
        inset: 32px;
        border: 2px solid var(--ink);
        padding: 40px 64px 32px;
        display: flex;
        flex-direction: column;
      }
      .mono {
        font-family: 'IBM Plex Mono', monospace;
        font-weight: 500;
        font-size: 17px;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--pencil);
      }
      .kicker {
        display: flex;
        align-items: center;
        gap: 14px;
        padding-bottom: 16px;
        border-bottom: 2px solid var(--ink);
      }
      .kicker .site {
        color: var(--ink);
      }
      .stamp {
        display: inline-block;
        padding: 2px 10px;
        border: 2px solid var(--ink);
        color: var(--ink);
        font-size: 16px;
        letter-spacing: 0.1em;
        transform: rotate(-2deg);
      }
      .stamp--pen {
        color: var(--pen);
        border-color: var(--pen);
      }
      .title {
        margin: 36px 0 0;
        max-width: 1008px;
        font-family: 'Archivo Variable', sans-serif;
        font-stretch: 85%;
        font-weight: 800;
        line-height: 0.95;
        letter-spacing: -0.01em;
      }
      .dek {
        margin: 24px 0 0;
        max-width: 900px;
        font-family: 'Source Serif 4 Variable', Georgia, serif;
        font-style: italic;
        font-weight: 400;
        font-size: 28px;
        line-height: 1.35;
        color: var(--pencil);
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 3;
        line-clamp: 3;
        overflow: hidden;
      }
      .foot {
        margin-top: auto;
        padding-top: 14px;
        border-top: 2px solid var(--ink);
        text-transform: none;
      }
    </style>
  </head>
  <body>
    <div class="frame">
      <div class="kicker mono">
        <span class="site">${e(SITE_NAME)}</span><span aria-hidden="true">·</span><span>${e(entryLabel(post.no))}</span><span aria-hidden="true">·</span><span class="${stampClass(post.type)}">${e(post.type)}</span><span aria-hidden="true">·</span><span>Filed ${e(post.date)}</span>
      </div>
      <h1 class="title" style="font-size: ${titleSize(post.title)}px">${e(post.title)}</h1>
      <p class="dek">${e(post.dek)}</p>
      <div class="foot mono">/log/${e(post.slug)}/</div>
    </div>
  </body>
</html>
`;
}

/**
 * A card's fields from a post file's frontmatter (`listPosts`), or an error
 * naming what's missing.
 *
 * @param {{ file: string, slug: string, data: Record<string, import('./frontmatter.mjs').FieldValue> }} post
 * @returns {CardPost}
 */
export function cardPostFrom({ file, slug, data }) {
  const { no, title, dek, type, date } = data;
  if (
    typeof no !== 'number' ||
    typeof title !== 'string' ||
    typeof dek !== 'string' ||
    (type !== 'essay' && type !== 'note' && type !== 'rant') ||
    typeof date !== 'string'
  ) {
    throw new Error(`${file} needs no, title, dek, type and date to make its card.`);
  }
  return { no, title, dek, type, date, slug };
}
