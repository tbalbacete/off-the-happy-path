import { describe, expect, it } from 'vitest';
import { codeToHtml } from 'shiki';
import { codeTheme, codeTransformers, parseCodeMeta } from '../src/lib/code';

describe('parseCodeMeta', () => {
  it('returns nothing for an empty or missing meta string', () => {
    expect(parseCodeMeta(undefined)).toEqual({});
    expect(parseCodeMeta('')).toEqual({});
  });

  it('reads a double-quoted title and note', () => {
    expect(parseCodeMeta('title="TICKET-4127.md" note="As written"')).toEqual({
      title: 'TICKET-4127.md',
      note: 'As written',
    });
  });

  it('allows one quote type inside the other', () => {
    expect(parseCodeMeta(`title='The "fix"' note="Don't ship"`)).toEqual({
      title: 'The "fix"',
      note: "Don't ship",
    });
  });

  it('ignores line ranges and other meta around the attributes', () => {
    expect(parseCodeMeta('{1,4-6} title="a.ts" showLineNumbers')).toEqual({ title: 'a.ts' });
    expect(parseCodeMeta('{3}')).toEqual({});
  });

  it('ignores unquoted values, empty values and look-alike keys', () => {
    expect(parseCodeMeta('title=bare subtitle="x" note=""')).toEqual({});
  });

  it('keeps the first value when a key repeats', () => {
    expect(parseCodeMeta('title="one" title="two"')).toEqual({ title: 'one' });
  });
});

const render = (code: string, meta?: string) =>
  codeToHtml(code, {
    lang: 'md',
    theme: codeTheme,
    meta: meta ? { __raw: meta } : undefined,
    transformers: codeTransformers(),
  });

const ticket = [
  '## Acceptance criteria',
  '- User can export the report as CSV',
  "- Export matches what's on screen",
  '- Works for large reports',
].join('\n');

describe('code blocks', () => {
  it('boxes a titled fence with the title and note in a caption bar', async () => {
    const html = await render(ticket, 'title="TICKET-4127.md" note="As written" {3}');
    expect(html).toMatch(/^<figure class="code-box"><figcaption class="code-box__caption">/);
    expect(html).toContain('<span class="code-box__title">TICKET-4127.md</span>');
    expect(html).toContain('<span class="code-box__note">As written</span>');
    expect(html).toMatch(/<\/figcaption><pre[^>]*>/);
    expect(html).toMatch(/<\/pre><\/figure>$/);
  });

  it('marks only the lines named in the meta as highlighted', async () => {
    const html = await render(ticket, 'title="TICKET-4127.md" {3}');
    const lines = [...html.matchAll(/<span class="line( highlighted)?">/g)].map((m) => Boolean(m[1]));
    expect(lines).toEqual([false, false, true, false]);
  });

  it('boxes an untitled fence without a caption bar', async () => {
    const html = await render(ticket);
    expect(html).toMatch(/^<figure class="code-box"><pre/);
    expect(html).not.toContain('figcaption');
  });

  it('leaves out the note span when there is no note', async () => {
    const html = await render(ticket, 'title="a.md"');
    expect(html).toContain('code-box__title');
    expect(html).not.toContain('code-box__note');
  });

  it('uses only CSS variables for color, never hex', async () => {
    const html = await render('const x = 1; // one', 'title="a.ts"');
    expect(html).toContain('var(--code-');
    expect(html).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
  });
});
