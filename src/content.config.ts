import { readFile } from 'node:fs/promises';
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import type { Loader } from 'astro/loaders';
import { z } from 'astro/zod';
import { isDateString, rawDateProblems, toDateString } from './lib/dates';
import { assertUniqueEntries } from './lib/entries';

/** A `YYYY-MM-DD` string. Unquoted YAML dates are normalised first. */
const dateString = z.preprocess(
  toDateString,
  z.string().refine(isDateString, { message: 'Must be a real date written as YYYY-MM-DD' }),
);

const tagSlug = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, { message: 'Tags must be lowercase slugs, e.g. "process" or "code-review"' });

/**
 * The glob loader, plus checks that fail the build when two posts share an
 * entry number or a slug, or when a raw date is impossible (see rawDateProblems). Entry ids are the file name (e.g. `001-hello-log`),
 * which the filesystem keeps unique; the URL slug is derived from it.
 */
function postsLoader(): Loader {
  const inner = glob({
    pattern: '**/*.md',
    base: './src/content/posts',
    generateId: ({ entry }) => entry.replace(/\.md$/, ''),
  });
  return {
    name: 'posts-loader',
    load: async (context) => {
      await inner.load(context);
      const entries = [...context.store.values()];
      const dateProblems: string[] = [];
      for (const entry of entries) {
        if (!entry.filePath) continue;
        const source = await readFile(new URL(entry.filePath, context.config.root), 'utf8');
        for (const problem of rawDateProblems(source)) dateProblems.push(`${entry.filePath} → ${problem}`);
      }
      if (dateProblems.length > 0) {
        throw new Error(`Invalid dates in src/content/posts:\n  - ${dateProblems.join('\n  - ')}`);
      }
      assertUniqueEntries(
        entries.map((e) => ({ id: e.id, no: (e.data as { no: number }).no })),
      );
    },
  };
}

const posts = defineCollection({
  loader: postsLoader(),
  schema: z.strictObject({
    no: z.number().int().positive(),
    title: z.string().min(1),
    dek: z.string().min(1),
    type: z.enum(['essay', 'note', 'rant']),
    date: dateString,
    revised: dateString.nullish(),
    tags: z.array(tagSlug).default([]),
    confidence: z.string().min(1).optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { posts };
