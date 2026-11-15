import { describe, expect, it } from 'vitest';
import {
  locateFrontmatter,
  readFrontmatter,
  setDate,
  setDraft,
  setField,
} from '../scripts/lib/frontmatter.mjs';

const post = `---
no: 16   # assigned by the script
title: "Nobody reads the \\"ticket\\""
dek: 'It''s a contract nobody signed.'
type: essay
date: 2026-11-12
revised:
tags: [process, requirements]
# confidence: "Opinion, lightly held"
draft: true
---

Body text. This line is not frontmatter:
draft: true
date: 1999-01-01
`;

describe('locateFrontmatter', () => {
  it('finds the text between the fences', () => {
    const fm = locateFrontmatter(post);
    expect(post.slice(fm.start, fm.end)).toBe(fm.text);
    expect(fm.text.startsWith('no: 16')).toBe(true);
    expect(fm.text.endsWith('draft: true')).toBe(true);
    expect(fm.eol).toBe('\n');
  });
  it('throws when there is no frontmatter', () => {
    expect(() => locateFrontmatter('just a body\n')).toThrow(/No frontmatter/);
    expect(() => locateFrontmatter('---\nno: 1\n')).toThrow(/No frontmatter/);
  });
});

describe('readFrontmatter', () => {
  it('reads every field type posts use', () => {
    expect(readFrontmatter(post)).toEqual({
      no: 16,
      title: 'Nobody reads the "ticket"',
      dek: "It's a contract nobody signed.",
      type: 'essay',
      date: '2026-11-12',
      revised: null,
      tags: ['process', 'requirements'],
      draft: true,
    });
  });
  it('ignores the body and comment lines', () => {
    const fields = readFrontmatter(post);
    expect(fields).not.toHaveProperty('confidence');
    expect(fields.date).toBe('2026-11-12');
  });
  it('reads quoted dates, empty and quoted flow lists, and block lists', () => {
    const src = `---\ndate: "2026-01-02"\ntags: []\nother: ["a b", 'c']\nlist:\n  - one\n  - "two"\ndraft: false\n---\n`;
    expect(readFrontmatter(src)).toEqual({
      date: '2026-01-02',
      tags: [],
      other: ['a b', 'c'],
      list: ['one', 'two'],
      draft: false,
    });
  });
  it('reads CRLF files', () => {
    const src = '---\r\nno: 3\r\ntitle: "T"\r\ndraft: true\r\n---\r\nBody\r\n';
    expect(readFrontmatter(src)).toEqual({ no: 3, title: 'T', draft: true });
  });
});

describe('setField / setDraft / setDate', () => {
  it('changes only the draft line', () => {
    const out = setDraft(post, false);
    expect(out).toBe(post.replace('draft: true\n---', 'draft: false\n---'));
    expect(out).toContain('Body text. This line is not frontmatter:\ndraft: true\n');
  });
  it('changes only the date line', () => {
    const out = setDate(post, '2026-11-14');
    expect(out).toBe(post.replace('date: 2026-11-12', 'date: 2026-11-14'));
    expect(out).toContain('\ndate: 1999-01-01\n');
  });
  it('keeps every other line byte for byte', () => {
    const out = setDate(setDraft(post, false), '2026-11-14');
    const before = post.split('\n');
    const after = out.split('\n');
    expect(after).toHaveLength(before.length);
    const changed = before.flatMap((line, i) => (line === after[i] ? [] : [i]));
    expect(changed.map((i) => after[i])).toEqual(['date: 2026-11-14', 'draft: false']);
  });
  it('keeps trailing comments and spacing after the colon', () => {
    const src = '---\ndraft:   true   # flip when ready\n---\n';
    expect(setDraft(src, false)).toBe('---\ndraft:   false   # flip when ready\n---\n');
  });
  it('keeps the date quoting style', () => {
    expect(setDate('---\ndate: "2026-01-01"\n---\n', '2026-11-14')).toBe(
      '---\ndate: "2026-11-14"\n---\n',
    );
    expect(setDate("---\ndate: '2026-01-01' # x\n---\n", '2026-11-14')).toBe(
      "---\ndate: '2026-11-14' # x\n---\n",
    );
  });
  it('fills an empty value', () => {
    expect(setField('---\nrevised:\n---\n', 'revised', '2026-11-14')).toBe(
      '---\nrevised: 2026-11-14\n---\n',
    );
  });
  it('adds a missing key as the last frontmatter line', () => {
    expect(setDraft('---\nno: 1\n---\nBody\n', false)).toBe('---\nno: 1\ndraft: false\n---\nBody\n');
  });
  it('does not touch keys that only share a prefix', () => {
    const src = '---\ndated: 2020-01-01\ndate: 2026-01-01\n---\n';
    expect(setDate(src, '2026-11-14')).toBe('---\ndated: 2020-01-01\ndate: 2026-11-14\n---\n');
  });
  it('preserves CRLF line endings', () => {
    const src = '---\r\nno: 3\r\ndate: 2026-01-01\r\ndraft: true\r\n---\r\nBody\r\n';
    expect(setDate(setDraft(src, false), '2026-11-14')).toBe(
      '---\r\nno: 3\r\ndate: 2026-11-14\r\ndraft: false\r\n---\r\nBody\r\n',
    );
  });
  it('round-trips with the reader', () => {
    const fields = readFrontmatter(setDate(setDraft(post, false), '2026-11-14'));
    expect(fields.draft).toBe(false);
    expect(fields.date).toBe('2026-11-14');
    expect(fields.no).toBe(16);
  });
});
