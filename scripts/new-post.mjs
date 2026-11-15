// @ts-check
/**
 * npm run new                                   prompts for everything
 * npm run new -- "Title" --type rant --tags process,meetings --dek "..."
 */
import { readFile } from 'node:fs/promises';
import { relative } from 'node:path';
import { createInterface } from 'node:readline';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { today } from './lib/dates.mjs';
import { DEFAULT_TYPE, POST_TYPES, parseTags, parseType } from './lib/template.mjs';
import { UsageError, createPost, existingTags, listPosts, titleProblem } from './lib/workflow.mjs';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const POSTS_DIR = fileURLToPath(new URL('../src/content/posts/', import.meta.url));
const TEMPLATE = fileURLToPath(new URL('../templates/post.md', import.meta.url));

const HELP = `Create a new draft post.

  npm run new
  npm run new -- "Title" [--type essay|note|rant] [--tags a,b] [--dek "..."]

With no title, it asks for each field. With a title, it uses the flags and
defaults (type essay, no tags, a placeholder dek).`;

/**
 * Ask questions one line at a time. Reading lines from an iterator (rather
 * than rl.question) also works when answers are piped in.
 */
function prompter() {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  rl.on('SIGINT', () => {
    rl.close();
    console.log('\nCancelled. Nothing was written.');
    process.exit(130);
  });
  const lines = rl[Symbol.asyncIterator]();
  return {
    /** @param {string} question */
    async ask(question) {
      rl.setPrompt(question);
      rl.prompt();
      const next = await lines.next();
      if (next.done) {
        process.stdout.write('\n');
        throw new UsageError('Input ended before all questions were answered. Nothing was written.');
      }
      return next.value.trim();
    },
    close: () => rl.close(),
  };
}

/** @param {import('./lib/workflow.mjs').PostFile[]} posts */
async function askForFields(posts) {
  const { ask, close } = prompter();
  try {
    let title = '';
    for (;;) {
      title = await ask('Title: ');
      const problem = title === '' ? 'A title is required.' : titleProblem(posts, title);
      if (!problem) break;
      console.log(`  ${problem}`);
    }

    /** @type {ReturnType<typeof parseType>} */
    let type;
    for (;;) {
      type = parseType(await ask(`Type (${POST_TYPES.join(' / ')}) [${DEFAULT_TYPE}]: `));
      if (type) break;
      console.log(`  Type must be one of: ${POST_TYPES.join(', ')}.`);
    }

    const known = existingTags(posts);
    if (known.length > 0) console.log(`  Existing tags: ${known.join(', ')}`);
    const tags = parseTags(await ask('Tags (comma-separated, optional): '));
    const dek = await ask('Dek (one or two sentences, optional): ');
    return { title, type, tags, dek };
  } finally {
    close();
  }
}

async function main() {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      type: { type: 'string', short: 't' },
      tags: { type: 'string' },
      dek: { type: 'string' },
      help: { type: 'boolean', short: 'h' },
    },
  });
  if (values.help) {
    console.log(HELP);
    return;
  }

  const posts = await listPosts(POSTS_DIR);
  const flagTitle = positionals.join(' ').trim();
  let fields;
  if (flagTitle === '') {
    fields = await askForFields(posts);
  } else {
    const type = parseType(values.type);
    if (!type) throw new UsageError(`--type must be one of: ${POST_TYPES.join(', ')}.`);
    fields = { title: flagTitle, type, tags: parseTags(values.tags), dek: values.dek };
  }

  const template = await readFile(TEMPLATE, 'utf8');
  const created = await createPost({ postsDir: POSTS_DIR, template, date: today(), ...fields });

  console.log(`
Created draft № ${String(created.no).padStart(3, '0')}: ${relative(ROOT, created.path)}
Preview at http://localhost:4321/log/${created.slug}/ (run npm run dev)`);
}

main().catch((error) => {
  if (error instanceof UsageError || error?.code?.startsWith?.('ERR_PARSE_ARGS')) {
    console.error(error.message);
    process.exit(1);
  }
  throw error;
});
