/** Small pure helpers shared by the secondary pages (tags, archive). */
import { site } from '../data/site';

/** 1 -> `1 entry`, 3 -> `3 entries`, 0 -> `0 entries`. */
export function entryCount(n: number): string {
  return `${n} ${n === 1 ? site.entryCount.one : site.entryCount.other}`;
}
