// @ts-check
/**
 * Screenshot Open Graph cards with the system Chrome, driven by playwright-core.
 * The pure parts (the card's HTML, its size steps) are in og-card.mjs; this
 * file only drives the browser and writes files.
 */
import { existsSync } from 'node:fs';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { CARD_HEIGHT, CARD_WIDTH, ogCardHtml } from './og-card.mjs';

export const DEFAULT_CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

/** Chrome isn't where we looked. Scripts print the message and exit 1. */
export class ChromeMissingError extends Error {
  name = 'ChromeMissingError';
}

/** The fonts the card must have loaded before the screenshot. */
const CARD_FONTS = ['Archivo Variable', 'Source Serif 4 Variable', 'IBM Plex Mono'];

/**
 * The Chrome binary to use: `CHROME_PATH`, or the macOS default.
 *
 * @param {NodeJS.ProcessEnv} [env]
 */
export function chromePath(env = process.env) {
  return env.CHROME_PATH || DEFAULT_CHROME_PATH;
}

/**
 * Where a post's card lives, relative to the repo root.
 *
 * @param {string} slug
 */
export function cardPath(slug) {
  return join('public', 'og', `${slug}.png`);
}

/**
 * @typedef {object} RenderedCard
 * @property {string} slug
 * @property {string} path  Absolute path of the PNG.
 * @property {() => Promise<void>} undo  Puts back the previous PNG, or removes the new one.
 */

/**
 * Render each post's card to `public/og/<slug>.png`.
 *
 * @param {import('./og-card.mjs').CardPost[]} posts
 * @param {{ root: string, chrome?: string }} options
 * @returns {Promise<RenderedCard[]>}
 */
export async function renderCards(posts, { root, chrome = chromePath() }) {
  if (!existsSync(chrome)) {
    throw new ChromeMissingError(`Chrome not found at ${chrome}. Set CHROME_PATH to a Chrome or Chromium binary.`);
  }
  const { chromium } = await import('playwright-core');
  const browser = await chromium.launch({ executablePath: chrome });
  /** @type {RenderedCard[]} */
  const rendered = [];
  try {
    const page = await browser.newPage({
      viewport: { width: CARD_WIDTH, height: CARD_HEIGHT },
      deviceScaleFactor: 1,
    });
    // A page in design/, so the card's `../node_modules` font URLs resolve.
    const base = pathToFileURL(join(root, 'design', 'og.html')).href;
    await mkdir(join(root, 'public', 'og'), { recursive: true });

    for (const post of posts) {
      await page.goto(base);
      await page.setContent(ogCardHtml(post), { waitUntil: 'load' });
      const missing = await page.evaluate(async (families) => {
        await document.fonts.ready;
        const loaded = new Set(
          [...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.family.replace(/^["']|["']$/g, '')),
        );
        return families.filter((f) => !loaded.has(f));
      }, CARD_FONTS);
      if (missing.length > 0) {
        throw new Error(`Fonts didn't load for the card: ${missing.join(', ')}. Run npm ci first.`);
      }
      const png = await page.screenshot({ type: 'png' });

      const path = join(root, cardPath(post.slug));
      const previous = existsSync(path) ? await readFile(path) : null;
      await writeFile(path, png);
      rendered.push({
        slug: post.slug,
        path,
        undo: () => (previous ? writeFile(path, previous) : rm(path, { force: true })),
      });
    }
  } catch (error) {
    for (const card of rendered) await card.undo();
    throw error;
  } finally {
    await browser.close();
  }
  return rendered;
}
