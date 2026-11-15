export const WORDS_PER_MINUTE = 230;

/** Count words: whitespace-separated tokens that contain a letter or digit. */
export function countWords(text: string): number {
  return text
    .split(/\s+/)
    .filter((token) => /[\p{L}\p{N}]/u.test(token)).length;
}

/** Reading time in whole minutes: about 230 wpm, rounded up, at least 1. */
export function readingTime(text: string): number {
  return Math.max(1, Math.ceil(countWords(text) / WORDS_PER_MINUTE));
}
