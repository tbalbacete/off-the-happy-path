// @ts-check
/**
 * npm run links      after `npm run build`
 *
 * Fails, listing each one, if any internal link in dist/**\/*.html points at
 * a page or file that wasn't built. External, mailto: and #anchor links are skipped.
 */
import { readFile, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { findBrokenLinks } from './lib/links.mjs';

const DIST = fileURLToPath(new URL('../dist/', import.meta.url));

/** @type {string[]} */
let files;
try {
  files = (await readdir(DIST, { recursive: true, withFileTypes: true }))
    .filter((d) => d.isFile())
    .map((d) => `${d.parentPath}/${d.name}`.slice(DIST.length).replaceAll('\\', '/').replace(/^\/+/, ''));
} catch {
  console.error('No dist folder. Run `npm run build` first.');
  process.exit(1);
}

const pages = new Map();
for (const file of files.filter((f) => f.endsWith('.html'))) {
  pages.set(file, await readFile(`${DIST}${file}`, 'utf8'));
}

const broken = findBrokenLinks(pages, new Set(files));
if (broken.length > 0) {
  console.error(`${broken.length} broken internal link(s):`);
  for (const { page, href } of broken) console.error(`  ${page} -> ${href}`);
  process.exit(1);
}
console.log(`Links OK: ${pages.size} pages checked.`);
