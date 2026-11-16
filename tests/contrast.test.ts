import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { contrastRatio, relativeLuminance } from '../src/lib/contrast';

const css = readFileSync(new URL('../src/styles/global.css', import.meta.url), 'utf8');

/** The body of the first rule whose selector is exactly `selector`. */
function block(selector: string): string {
  const at = css.indexOf(`${selector} {`);
  if (at < 0) throw new Error(`No "${selector}" block in global.css`);
  const start = css.indexOf('{', at) + 1;
  return css.slice(start, css.indexOf('}', start));
}

/** A block's color declarations, with `var(--x)` resolved within the block. */
function colors(body: string): Record<string, string> {
  const raw: Record<string, string> = {};
  for (const m of body.matchAll(/--([a-z-]+):\s*(#[0-9a-fA-F]{3,6}|var\(--[a-z-]+\))\s*;/g)) raw[m[1]] = m[2];
  const out: Record<string, string> = {};
  for (const [name, value] of Object.entries(raw)) {
    const ref = /^var\(--([a-z-]+)\)$/.exec(value);
    out[name] = ref ? raw[ref[1]] : value;
  }
  return out;
}

const light = colors(block(':root'));
const darkBySystem = colors(block(":root:not([data-theme='light'])"));
const darkByChoice = colors(block(":root[data-theme='dark']"));
const themes = { light, dark: { ...light, ...darkByChoice } };

describe('contrastRatio', () => {
  it('is 21 for black on white and 1 for a color on itself', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 5);
    expect(contrastRatio('#b3190f', '#b3190f')).toBeCloseTo(1, 5);
  });
  it('does not depend on argument order', () => {
    expect(contrastRatio('#111', '#f2f2ee')).toBe(contrastRatio('#f2f2ee', '#111'));
  });
  it('accepts three-digit hex', () => {
    expect(relativeLuminance('#fff')).toBeCloseTo(1, 5);
    expect(contrastRatio('#777', '#777777')).toBeCloseTo(1, 5);
  });
  it('matches a known WCAG value', () => {
    // #767676 on white is the classic 4.54:1 grey.
    expect(contrastRatio('#767676', '#ffffff')).toBeCloseTo(4.54, 2);
  });
  it('rejects anything that is not a hex color', () => {
    expect(() => contrastRatio('red', '#fff')).toThrow(/Not a hex color/);
  });
});

describe('the dark theme', () => {
  it('declares the same values for the system setting and the stored choice', () => {
    expect(darkBySystem).toEqual(darkByChoice);
  });
  it('overrides every color token', () => {
    for (const name of ['paper', 'ink', 'pencil', 'pen', 'highlighter', 'hairline', 'on-highlighter', 'on-highlighter-muted'])
      expect(darkByChoice[name], name).toMatch(/^#/);
  });
  it('uses the plan §6 values', () => {
    expect(darkByChoice).toMatchObject({
      paper: '#161614',
      ink: '#eceae3',
      pencil: '#a9a69c',
      pen: '#f0675c',
      highlighter: '#ffe14d',
      hairline: '#3b3a35',
      'on-highlighter': '#161614',
    });
  });
  it('sets color-scheme in each block', () => {
    expect(block(':root')).toMatch(/color-scheme:\s*light;/);
    expect(block(":root:not([data-theme='light'])")).toMatch(/color-scheme:\s*dark;/);
    expect(block(":root[data-theme='dark']")).toMatch(/color-scheme:\s*dark;/);
  });
  it('applies on screen only, so print stays light', () => {
    expect(css).toContain("@media screen and (prefers-color-scheme: dark) {\n  :root:not([data-theme='light'])");
    expect(css).toContain("@media screen {\n  :root[data-theme='dark']");
  });
});

describe('text and background pairs in use', () => {
  // Every pair the site sets text in: [text, background].
  const pairs: [string, string][] = [
    ['ink', 'paper'], // body text, titles, rules
    ['pencil', 'paper'], // labels, dates, meta
    ['pen', 'paper'], // active nav, RANT stamp, key links, LATEST, sidenotes
    ['paper', 'ink'], // the CURRENTLY header bar, hovered buttons
    ['on-highlighter', 'highlighter'], // highlighted code lines
    ['on-highlighter-muted', 'highlighter'], // code comments and punctuation on a highlighted line
  ];

  it('finds every token it needs in global.css', () => {
    for (const name of ['paper', 'ink', 'pencil', 'pen', 'highlighter', 'on-highlighter', 'on-highlighter-muted'])
      expect(light[name], name).toBeDefined();
  });

  for (const [theme, t] of Object.entries(themes)) {
    for (const [text, bg] of pairs) {
      it(`${theme}: ${text} on ${bg} is at least 4.5:1`, () => {
        expect(contrastRatio(t[text], t[bg])).toBeGreaterThanOrEqual(4.5);
      });
    }
  }
});

/** Every source file under `dir`. */
function files(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? files(join(dir, e.name)) : [join(dir, e.name)],
  );
}

describe('no hard-coded colors', () => {
  const color =
    /(?<![\w&])#(?:[0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{3})\b|\b(?:rgba?|hsla?|hwb|oklch|lab|lch)\(|(?:^|[\s;{])(?:color|background(?:-color)?|border(?:-[a-z]+)*|outline(?:-color)?|fill|stroke|text-decoration-color|caret-color|accent-color):\s*(?:white|black|red|gr[ae]y|silver)\b/im;
  // global.css is checked with its token blocks taken out.
  const tokenBlocks = [':root', ":root:not([data-theme='light'])", ":root[data-theme='dark']"].map(block);
  const src = new URL('../src/', import.meta.url).pathname;
  const sources = files(src).filter((f) => /\.(astro|css|ts|mjs|js)$/.test(f) && !f.includes('/content/'));

  it('finds the source files', () => {
    expect(sources.length).toBeGreaterThan(20);
  });
  for (const file of sources) {
    it(`none in ${file.slice(src.length)}`, () => {
      let text = readFileSync(file, 'utf8');
      if (file.endsWith('global.css')) for (const b of tokenBlocks) text = text.replace(b, '');
      expect(text.match(color)?.[0]).toBeUndefined();
    });
  }
});
