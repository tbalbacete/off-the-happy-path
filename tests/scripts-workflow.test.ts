import { mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  UsageError,
  createPost,
  existingTags,
  listPosts,
  titleProblem,
} from '../scripts/lib/workflow.mjs';

const TEMPLATE = '---\nno: {{no}}\ntitle: {{title}}\ndek: {{dek}}\ntype: {{type}}\ndate: {{date}}\ntags: {{tags}}\ndraft: {{draft}}\n---\n';

let dir: string;
beforeEach(async () => {
  dir = await mkdtemp(join(tmpdir(), 'othp-workflow-'));
});
afterEach(async () => {
  await rm(dir, { recursive: true, force: true });
});

async function seed(file: string, content: string) {
  await writeFile(join(dir, file), content);
}

const base = { template: TEMPLATE, type: 'essay' as const, tags: [], date: '2026-11-14' };

describe('listPosts / existingTags', () => {
  it('lists Markdown posts with their slug, number and fields', async () => {
    await seed('002-b.md', '---\nno: 2\ntags: [process, meta]\n---\n');
    await seed('001-a.md', '---\nno: 1\ntags: [meta]\n---\n');
    await seed('notes.txt', 'not a post');
    const posts = await listPosts(dir);
    expect(posts.map((p) => [p.file, p.slug, p.no])).toEqual([
      ['001-a.md', 'a', 1],
      ['002-b.md', 'b', 2],
    ]);
    expect(existingTags(posts)).toEqual(['meta', 'process']);
  });
  it('still lists a post with broken frontmatter, so its slug stays taken', async () => {
    await seed('003-broken.md', 'no fences here');
    const posts = await listPosts(dir);
    expect(posts).toHaveLength(1);
    expect(posts[0].slug).toBe('broken');
    expect(titleProblem(posts, 'Broken')).toMatch(/already used by 003-broken.md/);
  });
});

describe('titleProblem', () => {
  it('rejects a title with nothing to slug', () => {
    expect(titleProblem([], '?!')).toMatch(/at least one letter or digit/);
  });
  it('accepts a fresh title', () => {
    expect(titleProblem([], 'Fresh')).toBeUndefined();
  });
});

describe('createPost', () => {
  it('writes 001 into an empty folder', async () => {
    const created = await createPost({ ...base, postsDir: dir, title: 'First post' });
    expect(created).toMatchObject({ file: '001-first-post.md', slug: 'first-post', no: 1 });
    const text = await readFile(created.path, 'utf8');
    expect(text).toContain('no: 1\ntitle: "First post"\n');
    expect(text).toContain('date: 2026-11-14\n');
    expect(text).toContain('draft: true\n');
  });

  it('numbers after the highest post, drafts included', async () => {
    await seed('001-a.md', '---\nno: 1\ndraft: false\n---\n');
    await seed('007-b.md', '---\nno: 7\ndraft: true\n---\n');
    const created = await createPost({ ...base, postsDir: dir, title: 'Next' });
    expect(created.file).toBe('008-next.md');
  });

  it('refuses an existing slug and writes nothing', async () => {
    await seed('001-same-title.md', '---\nno: 1\n---\n');
    await expect(createPost({ ...base, postsDir: dir, title: 'Same title!' })).rejects.toThrow(
      UsageError,
    );
    expect(await readdir(dir)).toEqual(['001-same-title.md']);
  });

  it('refuses a title with no slug', async () => {
    await expect(createPost({ ...base, postsDir: dir, title: '...' })).rejects.toThrow(
      /at least one letter/,
    );
    expect(await readdir(dir)).toEqual([]);
  });
});
