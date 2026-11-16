// @ts-check
/**
 * npm run publish -- <slug-or-number> [--keep-date]
 *
 * Renders the post's Open Graph card with the system Chrome, sets draft:
 * false and date: today (unless --keep-date), then runs `npm run check` and
 * `npm run build`. If the card fails, nothing is changed; if check or build
 * fails, the post and card are put back exactly as they were. Prints the git
 * commands; never runs git.
 */
import { spawn } from 'node:child_process';
import { relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { today } from './lib/dates.mjs';
import { CardError, cardPath, renderCards } from './lib/og-render.mjs';
import { UsageError, publishPost } from './lib/workflow.mjs';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const POSTS_DIR = fileURLToPath(new URL('../src/content/posts/', import.meta.url));

const HELP = `Publish a draft post.

  npm run publish -- <slug-or-number> [--keep-date]

Renders the post's Open Graph card (public/og/<slug>.png) with the system
Chrome, sets draft: false and the date to today (--keep-date keeps the
existing date), then runs npm run check and npm run build. If the card
can't be made, nothing changes. If check or build fails, the post and card
are restored and the exit code is non-zero. Set CHROME_PATH if Chrome isn't
at the macOS default.`;

/**
 * Run an npm script with its output shown. Resolves true on exit code 0.
 *
 * @param {string} script
 * @returns {Promise<boolean>}
 */
function runNpm(script) {
  console.log(`\n> npm run ${script}`);
  return new Promise((resolve) => {
    const child = spawn('npm', ['run', script], { cwd: ROOT, stdio: 'inherit' });
    child.on('error', () => resolve(false));
    child.on('close', (code) => resolve(code === 0));
  });
}

let interrupted = false;

/** Ctrl-C reaches the child too; keep this process alive so it can restore the post. */
async function ignoreInterruptsWhile(/** @type {() => Promise<boolean>} */ fn) {
  const onSigint = () => {
    interrupted = true;
  };
  process.on('SIGINT', onSigint);
  try {
    return (await fn()) && !interrupted;
  } finally {
    process.off('SIGINT', onSigint);
  }
}

async function main() {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      'keep-date': { type: 'boolean' },
      help: { type: 'boolean', short: 'h' },
    },
  });
  if (values.help) {
    console.log(HELP);
    return;
  }
  if (positionals.length !== 1) {
    throw new UsageError('Usage: npm run publish -- <slug-or-number> [--keep-date]');
  }

  /** @type {string | undefined} */
  let failedStep;
  const result = await publishPost({
    postsDir: POSTS_DIR,
    query: positionals[0],
    date: today(),
    keepDate: values['keep-date'] ?? false,
    card: async (cardPost) => {
      console.log(`\n> card ${cardPath(cardPost.slug)}`);
      const [rendered] = await renderCards([cardPost], { root: ROOT });
      return rendered.undo;
    },
    verify: () =>
      ignoreInterruptsWhile(async () => {
        for (const step of ['check', 'build']) {
          if (!(await runNpm(step))) {
            failedStep = step;
            return false;
          }
        }
        return true;
      }),
  });

  const { post } = result;
  const path = relative(ROOT, post.path);
  const label = `№ ${String(post.no ?? '?').padStart(3, '0')}`;

  if (!result.ok) {
    console.error(
      `\n${interrupted ? 'Interrupted' : `npm run ${failedStep} failed`}. ${path} and its card were restored to how they were.`,
    );
    process.exitCode = 1;
    return;
  }

  console.log(`
Published ${label} (${post.slug}), dated ${result.date}.${result.wasDraft ? '' : ' (It was already published.)'}
Card, check and build passed. When you're ready:

  git add ${path} ${cardPath(post.slug)}
  git commit -m "Entry ${String(post.no ?? '').padStart(3, '0')}"
  git push`);
}

main().catch((error) => {
  if (error instanceof UsageError || error instanceof CardError || error?.code?.startsWith?.('ERR_PARSE_ARGS')) {
    console.error(error.message);
    process.exit(1);
  }
  throw error;
});
