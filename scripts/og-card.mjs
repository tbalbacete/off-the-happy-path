// @ts-check
/**
 * npm run og -- <slug-or-number>
 * npm run og -- --all
 *
 * Renders a post's Open Graph card to public/og/<slug>.png with the system
 * Chrome (CHROME_PATH overrides the default). Run it again after changing a
 * published post's title or dek. Prints the git commands; never runs git.
 */
import { relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { findPost } from './lib/entries.mjs';
import { cardPostFrom } from './lib/og-card.mjs';
import { CardError, renderCards } from './lib/og-render.mjs';
import { UsageError, listPosts } from './lib/workflow.mjs';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const POSTS_DIR = fileURLToPath(new URL('../src/content/posts/', import.meta.url));

const HELP = `Render Open Graph cards for posts.

  npm run og -- <slug-or-number>
  npm run og -- --all          every published post

Writes public/og/<slug>.png (1200x630) with the system Chrome. Set
CHROME_PATH if Chrome isn't at the macOS default.`;

async function main() {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      all: { type: 'boolean' },
      help: { type: 'boolean', short: 'h' },
    },
  });
  if (values.help) {
    console.log(HELP);
    return;
  }
  if (values.all ? positionals.length !== 0 : positionals.length !== 1) {
    throw new UsageError('Usage: npm run og -- <slug-or-number> | --all');
  }

  const posts = await listPosts(POSTS_DIR);
  let chosen = posts;
  if (values.all) {
    chosen = posts.filter((p) => p.data.draft === false);
  } else {
    const post = findPost(posts, positionals[0]);
    if (!post) throw new UsageError(`No post matches "${positionals[0]}".`);
    chosen = [post];
  }

  /** @type {import('./lib/og-card.mjs').CardPost[]} */
  let cards;
  try {
    cards = chosen.map(cardPostFrom);
  } catch (error) {
    throw new UsageError(/** @type {Error} */ (error).message);
  }
  const rendered = await renderCards(cards, { root: ROOT });
  const paths = rendered.map((c) => relative(ROOT, c.path));
  for (const p of paths) console.log(`Wrote ${p}`);
  if (paths.length > 0) {
    console.log(`\nWhen you're ready:\n\n  git add ${paths.join(' ')}`);
  }
}

main().catch((error) => {
  if (error instanceof UsageError || error instanceof CardError || error?.code?.startsWith?.('ERR_PARSE_ARGS')) {
    console.error(error.message);
    process.exit(1);
  }
  throw error;
});
