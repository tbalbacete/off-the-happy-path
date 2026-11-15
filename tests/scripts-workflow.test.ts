import { mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { DEK_PLACEHOLDER } from '../scripts/lib/template.mjs';
import {
  UsageError,
  createPost,
  existingTags,
  listPosts,
  publishPost,
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

describe('publishPost', () => {
  const draft = `---
no: 4   # keep me
title: "A draft"
dek: "Real dek."
type: note
date: "2026-01-02"
tags: [meta]
draft: true
---

Body with draft: true in it.
`;
  const pass = async () => true;
  const fail = async () => false;

  it('flips draft and sets the date to today, changing only those lines', async () => {
    await seed('004-a-draft.md', draft);
    const result = await publishPost({ postsDir: dir, query: '4', date: '2026-11-14', verify: pass });
    expect(result).toMatchObject({ ok: true, date: '2026-11-14', wasDraft: true });
    expect(await readFile(join(dir, '004-a-draft.md'), 'utf8')).toBe(
      draft.replace('date: "2026-01-02"', 'date: "2026-11-14"').replace('draft: true\n---', 'draft: false\n---'),
    );
  });

  it('keeps the existing date with keepDate', async () => {
    await seed('004-a-draft.md', draft);
    const result = await publishPost({
      postsDir: dir,
      query: 'a-draft',
      date: '2026-11-14',
      keepDate: true,
      verify: pass,
    });
    expect(result.date).toBe('2026-01-02');
    expect(await readFile(join(dir, '004-a-draft.md'), 'utf8')).toBe(
      draft.replace('draft: true\n---', 'draft: false\n---'),
    );
  });

  it('runs verify with the published file in place', async () => {
    await seed('004-a-draft.md', draft);
    let seen = '';
    await publishPost({
      postsDir: dir,
      query: '004',
      date: '2026-11-14',
      verify: async () => {
        seen = await readFile(join(dir, '004-a-draft.md'), 'utf8');
        return true;
      },
    });
    expect(seen).toContain('draft: false\n---');
  });

  it('restores the file byte for byte when verify fails', async () => {
    await seed('004-a-draft.md', draft);
    const result = await publishPost({ postsDir: dir, query: '4', date: '2026-11-14', verify: fail });
    expect(result.ok).toBe(false);
    expect(await readFile(join(dir, '004-a-draft.md'), 'utf8')).toBe(draft);
  });

  it('restores the file when verify throws', async () => {
    await seed('004-a-draft.md', draft);
    await expect(
      publishPost({
        postsDir: dir,
        query: '4',
        date: '2026-11-14',
        verify: async () => {
          throw new Error('spawn failed');
        },
      }),
    ).rejects.toThrow('spawn failed');
    expect(await readFile(join(dir, '004-a-draft.md'), 'utf8')).toBe(draft);
  });

  it('refuses an unknown post', async () => {
    await seed('004-a-draft.md', draft);
    await expect(
      publishPost({ postsDir: dir, query: 'nope', date: '2026-11-14', verify: pass }),
    ).rejects.toThrow(/No post matches "nope". Posts: 4 a-draft/);
  });

  it('refuses a post that still has the placeholder dek', async () => {
    const placeholder = draft.replace('"Real dek."', JSON.stringify(DEK_PLACEHOLDER));
    await seed('004-a-draft.md', placeholder);
    await expect(
      publishPost({ postsDir: dir, query: '4', date: '2026-11-14', verify: pass }),
    ).rejects.toThrow(/placeholder dek/);
    expect(await readFile(join(dir, '004-a-draft.md'), 'utf8')).toBe(placeholder);
  });

  it('reports a post that was already published', async () => {
    await seed('004-a-draft.md', draft.replace('draft: true', 'draft: false'));
    const result = await publishPost({ postsDir: dir, query: '4', date: '2026-11-14', verify: pass });
    expect(result.wasDraft).toBe(false);
  });
});
