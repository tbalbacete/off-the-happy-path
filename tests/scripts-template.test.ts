import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { rawDateProblems } from '../src/lib/dates';
import { readFrontmatter } from '../scripts/lib/frontmatter.mjs';
import {
  DEK_PLACEHOLDER,
  fillTemplate,
  oneLine,
  parseTags,
  parseType,
  templateValues,
  yamlString,
} from '../scripts/lib/template.mjs';

const template = readFileSync(new URL('../templates/post.md', import.meta.url), 'utf8');

describe('yamlString / oneLine', () => {
  it('quotes and escapes', () => {
    expect(yamlString('Say "no": twice')).toBe('"Say \\"no\\": twice"');
    expect(yamlString('back\\slash')).toBe('"back\\\\slash"');
  });
  it('collapses whitespace', () => {
    expect(oneLine('  a\n b\t\tc  ')).toBe('a b c');
  });
});

describe('parseTags', () => {
  it('splits on commas and slugifies', () => {
    expect(parseTags('process, Code Review,meetings')).toEqual(['process', 'code-review', 'meetings']);
  });
  it('drops empties and duplicates', () => {
    expect(parseTags('a,, ,A, a ')).toEqual(['a']);
    expect(parseTags('')).toEqual([]);
    expect(parseTags(undefined)).toEqual([]);
  });
  it('accepts a list', () => {
    expect(parseTags(['AI', 'ai', 'Tools'])).toEqual(['ai', 'tools']);
  });
});

describe('parseType', () => {
  it('defaults to essay', () => {
    expect(parseType('')).toBe('essay');
    expect(parseType(undefined)).toBe('essay');
  });
  it('accepts known types in any case', () => {
    expect(parseType('Rant')).toBe('rant');
    expect(parseType(' note ')).toBe('note');
  });
  it('rejects unknown types', () => {
    expect(parseType('blog')).toBeUndefined();
  });
});

describe('fillTemplate', () => {
  it('replaces placeholders, with or without inner spaces', () => {
    expect(fillTemplate('a {{x}} b {{ y }}', { x: '1', y: '2' })).toBe('a 1 b 2');
  });
  it('throws on a placeholder with no value', () => {
    expect(() => fillTemplate('{{x}} {{z}}', { x: '1' })).toThrow(/no value: z/);
  });
});

describe('templates/post.md', () => {
  const fields = {
    no: 16,
    title: 'Nobody reads the "ticket": a story',
    type: 'rant' as const,
    date: '2026-11-14',
    tags: ['process', 'requirements'],
  };

  it('fills into a draft with every schema field', () => {
    const post = fillTemplate(template, templateValues({ ...fields, dek: 'Short dek.' }));
    expect(post).not.toMatch(/\{\{/);
    expect(readFrontmatter(post)).toEqual({
      no: 16,
      title: 'Nobody reads the "ticket": a story',
      dek: 'Short dek.',
      type: 'rant',
      date: '2026-11-14',
      revised: null,
      tags: ['process', 'requirements'],
      draft: true,
    });
    expect(rawDateProblems(post)).toEqual([]);
  });

  it('uses the dek placeholder when no dek is given', () => {
    const post = fillTemplate(template, templateValues({ ...fields, dek: '   ' }));
    expect(readFrontmatter(post).dek).toBe(DEK_PLACEHOLDER);
  });

  it('writes an empty tag list as []', () => {
    const post = fillTemplate(template, templateValues({ ...fields, tags: [] }));
    expect(readFrontmatter(post).tags).toEqual([]);
  });

  it('keeps the writing reminders inside the frontmatter, where they cannot render', () => {
    const post = fillTemplate(template, templateValues(fields));
    const body = post.replace(/^---\n[\s\S]*?\n---\n/, '');
    expect(post).toContain('[^1]');
    expect(post).toContain('<mark>');
    expect(post).toContain('title="');
    expect(body.trim()).toBe('');
  });
});
