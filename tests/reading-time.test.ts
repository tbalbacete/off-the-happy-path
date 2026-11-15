import { describe, expect, it } from 'vitest';
import { countWords, readingTime } from '../src/lib/reading-time';

const words = (n: number) => Array.from({ length: n }, () => 'word').join(' ');

describe('countWords', () => {
  it('counts whitespace-separated words', () => {
    expect(countWords('one two  three\nfour\tfive')).toBe(5);
  });
  it('ignores punctuation-only tokens like Markdown markers', () => {
    expect(countWords('# Heading\n\n- item — done ---')).toBe(3);
  });
  it('returns 0 for empty text', () => {
    expect(countWords('   ')).toBe(0);
  });
});

describe('readingTime', () => {
  it('is at least 1 minute', () => {
    expect(readingTime('')).toBe(1);
    expect(readingTime('short')).toBe(1);
  });
  it('is exactly 1 minute at 230 words', () => {
    expect(readingTime(words(230))).toBe(1);
  });
  it('rounds up', () => {
    expect(readingTime(words(231))).toBe(2);
    expect(readingTime(words(460))).toBe(2);
    expect(readingTime(words(461))).toBe(3);
  });
});
