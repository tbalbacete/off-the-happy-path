/**
 * New and publish end to end, against a temp folder seeded with the fixture
 * posts in tests/fixtures/posts (one published, one draft) and the real template. No real src/content/posts, no real build: `verify`
 * stands in for check + build and applies the site's own rules instead.
 */
import { copyFile, mkdtemp, readdir, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { isDateString, rawDateProblems } from '../src/lib/dates';
import { assertUniqueEntries, slugFromId } from '../src/lib/entries';
import { readFrontmatter } from '../scripts/lib/frontmatter.mjs';
import { POST_TYPES } from '../scripts/lib/template.mjs';
import { UsageError, createPost, listPosts, publishPost } from '../scripts/lib/workflow.mjs';

const ROOT = new URL('../', import.meta.url);
const SAMPLES = ['001-hello-log.md', '002-draft-example.md'];
const TAG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

let dir: string;
let template: string;
let realBefore: Record<string, string>;

/** Every file in the real posts folder, with its contents. */
async function snapshotRealPosts(): Promise<Record<string, string>> {
  const realDir = new URL('src/content/posts/', ROOT);
  const files = (await readdir(realDir)).sort();
  const entries = await Promise.all(
    files.map(async (f) => [f, await readFile(new URL(f, realDir), 'utf8')] as const),
  );
  return Object.fromEntries(entries);
}

beforeAll(async () => {
  realBefore = await snapshotRealPosts();
  dir = await mkdtemp(join(tmpdir(), 'othp-integration-'));
  for (const file of SAMPLES) {
    await copyFile(new URL(`tests/fixtures/posts/${file}`, ROOT), join(dir, file));
  }
  template = await readFile(new URL('templates/post.md', ROOT), 'utf8');
});
afterAll(async () => {
  await rm(dir, { recursive: true, force: true });
});

/** The parts of the site's schema and loader checks a script could get wrong. */
async function siteRulesPass(): Promise<boolean> {
  const posts = await listPosts(dir);
  assertUniqueEntries(posts.map((p) => ({ id: p.file.replace(/\.md$/, ''), no: p.no ?? -1 })));
  for (const p of posts) {
    const d = p.data;
    if (rawDateProblems(p.source).length > 0) return false;
    if (typeof d.no !== 'number' || typeof d.title !== 'string' || typeof d.dek !== 'string') return false;
    if (!POST_TYPES.includes(d.type as never)) return false;
    if (typeof d.date !== 'string' || !isDateString(d.date)) return false;
    if (!Array.isArray(d.tags) || !d.tags.every((t) => TAG.test(t))) return false;
    if (typeof d.draft !== 'boolean') return false;
  }
  return true;
}

const read = (file: string) => readFile(join(dir, file), 'utf8');

describe('new, then publish', () => {
  let file = '';

  it('creates the next draft from the real template', async () => {
    const created = await createPost({
      postsDir: dir,
      template,
      title: 'Estimates are apologies in advance',
      type: 'rant',
      tags: ['process', 'meetings'],
      dek: 'We promise a date, then apologise for it.',
      date: '2026-11-14',
    });
    file = created.file;
    expect(created).toMatchObject({ no: 3, slug: 'estimates-are-apologies-in-advance' });
    expect(file).toBe('003-estimates-are-apologies-in-advance.md');
    expect(slugFromId(file.replace(/\.md$/, ''))).toBe(created.slug);

    const fields = readFrontmatter(await read(file));
    expect(fields).toMatchObject({ no: 3, type: 'rant', date: '2026-11-14', draft: true });
    expect(await siteRulesPass()).toBe(true);
  });

  it('refuses the same title again and leaves the folder alone', async () => {
    const before = await readdir(dir);
    await expect(
      createPost({
        postsDir: dir,
        template,
        title: 'Estimates: are apologies, in advance?',
        type: 'essay',
        tags: [],
        date: '2026-11-14',
      }),
    ).rejects.toThrow(UsageError);
    expect(await readdir(dir)).toEqual(before);
  });

  it('leaves the post unchanged when check or build fails', async () => {
    const before = await read(file);
    const result = await publishPost({
      postsDir: dir,
      query: 'estimates-are-apologies-in-advance',
      date: '2026-11-20',
      verify: async () => false,
    });
    expect(result.ok).toBe(false);
    expect(await read(file)).toBe(before);
  });

  it('publishes by number, dates it today, and passes the site rules', async () => {
    const before = await read(file);
    let rulesPassed = false;
    const result = await publishPost({
      postsDir: dir,
      query: '003',
      date: '2026-11-20',
      verify: async () => (rulesPassed = await siteRulesPass()),
    });
    expect(rulesPassed).toBe(true);
    expect(result).toMatchObject({ ok: true, date: '2026-11-20', wasDraft: true });

    const after = await read(file);
    expect(readFrontmatter(after)).toMatchObject({ draft: false, date: '2026-11-20' });
    // Only the date and draft lines changed; template comments survived.
    const changed = after.split('\n').filter((line, i) => line !== before.split('\n')[i]);
    expect(changed).toEqual(['date: 2026-11-20', 'draft: false']);
    expect(after).toContain('# Writing reminders.');
  });

  it('keeps the date with keepDate when re-publishing', async () => {
    const result = await publishPost({
      postsDir: dir,
      query: '3',
      date: '2026-12-01',
      keepDate: true,
      verify: async () => true,
    });
    expect(result).toMatchObject({ ok: true, date: '2026-11-20', wasDraft: false });
  });

  it('numbers the next post after it', async () => {
    const created = await createPost({
      postsDir: dir,
      template,
      title: 'A note',
      type: 'note',
      tags: [],
      date: '2026-11-21',
    });
    expect(created.file).toBe('004-a-note.md');
    expect(await siteRulesPass()).toBe(true);
  });

  it('never touched the real posts folder', async () => {
    expect(await snapshotRealPosts()).toEqual(realBefore);
  });
});
