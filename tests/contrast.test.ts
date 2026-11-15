import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { contrastRatio, relativeLuminance } from '../src/lib/contrast';

/** The color tokens as declared in global.css, so the test checks the real values. */
function tokens(): Record<string, string> {
  const css = readFileSync(new URL('../src/styles/global.css', import.meta.url), 'utf8');
  const out: Record<string, string> = {};
  for (const m of css.matchAll(/--([a-z-]+):\s*(#[0-9a-fA-F]{3,6})\s*;/g)) out[m[1]] = m[2];
  return out;
}

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

describe('text and background pairs in use', () => {
  const t = tokens();
  // Every pair the site sets text in: [text, background].
  const pairs: [string, string][] = [
    ['ink', 'paper'], // body text, titles, rules
    ['pencil', 'paper'], // labels, dates, meta
    ['pen', 'paper'], // active nav, RANT stamp, key links, LATEST
    ['paper', 'ink'], // the CURRENTLY header bar
    ['ink', 'highlighter'], // the featured title, <mark>, highlighted code lines
    ['pencil', 'highlighter'], // code comments and punctuation on a highlighted line
  ];

  it('finds every token it needs in global.css', () => {
    for (const name of ['paper', 'ink', 'pencil', 'pen', 'highlighter']) expect(t[name]).toBeDefined();
  });

  for (const [text, bg] of pairs) {
    it(`${text} on ${bg} is at least 4.5:1`, () => {
      expect(contrastRatio(t[text], t[bg])).toBeGreaterThanOrEqual(4.5);
    });
  }
});
