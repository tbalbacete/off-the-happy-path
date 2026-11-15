/** WCAG 2 contrast between two colors written as `#rgb` or `#rrggbb`. */

function parseHex(hex: string): [number, number, number] {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) throw new Error(`Not a hex color: "${hex}"`);
  const h = m[1].length === 3 ? [...m[1]].map((c) => c + c).join('') : m[1];
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)) as [number, number, number];
}

/** Relative luminance, 0 (black) to 1 (white). */
export function relativeLuminance(hex: string): number {
  const [r, g, b] = parseHex(hex).map((v) => {
    const c = v / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Contrast ratio from 1 to 21. Order of the two colors doesn't matter. */
export function contrastRatio(hexA: string, hexB: string): number {
  const [hi, lo] = [relativeLuminance(hexA), relativeLuminance(hexB)].sort((a, b) => b - a);
  return (hi + 0.05) / (lo + 0.05);
}
