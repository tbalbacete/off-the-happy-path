import { describe, expect, it } from 'vitest';
import { neighbourLink, postMeta, prevNext, replyHref, replySubject } from '../src/lib/post';

const post = (no: number) => ({ id: `${no}`, data: { no } });
/** Newest first, like getPosts returns them. */
const newestFirst = (...nos: number[]) => nos.map(post);
const no = (p: { data: { no: number } } | null) => p?.data.no ?? null;

describe('prevNext', () => {
  const posts = newestFirst(4, 3, 1);

  it('gives no next on the newest entry', () => {
    const { previous, next } = prevNext(posts, 4);
    expect(no(previous)).toBe(3);
    expect(next).toBeNull();
  });

  it('gives no previous on the oldest entry', () => {
    const { previous, next } = prevNext(posts, 1);
    expect(previous).toBeNull();
    expect(no(next)).toBe(3);
  });

  it('links both ways from a middle entry, skipping gaps in numbering', () => {
    const { previous, next } = prevNext(posts, 3);
    expect(no(previous)).toBe(1);
    expect(no(next)).toBe(4);
  });

  it('gives neither for the only entry', () => {
    expect(prevNext(newestFirst(7), 7)).toEqual({ previous: null, next: null });
  });

  it('throws for an entry that is not in the list', () => {
    expect(() => prevNext(posts, 2)).toThrow(/Entry 2/);
  });
});

describe('neighbourLink', () => {
  it('gives the number, title and page of a neighbour', () => {
    const p = { id: '003-deploy-check', data: { no: 3, title: 'Deploy check' } };
    expect(neighbourLink(p)).toEqual({ no: 3, title: 'Deploy check', href: '/log/deploy-check/' });
  });
  it('is null at the end of the log', () => {
    expect(neighbourLink(null)).toBeNull();
  });
});

describe('replyHref', () => {
  it('builds the subject from the padded entry number', () => {
    expect(replySubject(15)).toBe('Re: № 015');
  });

  it('is a mailto with the subject URL-encoded', () => {
    expect(replyHref('me@example.com', 4)).toBe('mailto:me@example.com?subject=Re%3A%20%E2%84%96%20004');
  });

  it('round-trips back to the subject', () => {
    const url = new URL(replyHref('me@example.com', 123));
    expect(url.protocol).toBe('mailto:');
    expect(url.pathname).toBe('me@example.com');
    expect(decodeURIComponent(url.search.replace('?subject=', ''))).toBe('Re: № 123');
  });
});

describe('postMeta', () => {
  const base = { no: 15, date: '2026-11-12', revised: null, tags: ['process', 'legacy-code'] };

  it('lists the rows in order, with a dash for no revised date and no confidence row', () => {
    const rows = postMeta({ data: base }, 9);
    expect(rows.map((r) => [r.label, r.value])).toEqual([
      ['Entry', '015'],
      ['Filed', '2026-11-12'],
      ['Revised', '—'],
      ['Reading time', '9 min'],
      ['Filed under', 'Process, Legacy code'],
    ]);
  });

  it('uses tag display names for FILED UNDER and its links', () => {
    const rows = postMeta({ data: { ...base, tags: ['ai', 'process'] } }, 9);
    const filed = rows.find((r) => r.label === 'Filed under');
    expect(filed?.value).toBe('AI, honestly, Process');
    expect(filed?.links).toEqual([
      { label: 'AI, honestly', href: '/tag/ai/' },
      { label: 'Process', href: '/tag/process/' },
    ]);
  });

  it('links each tag to its tag page', () => {
    const filedUnder = postMeta({ data: base }, 9)[4];
    expect(filedUnder.links).toEqual([
      { label: 'Process', href: '/tag/process/' },
      { label: 'Legacy code', href: '/tag/legacy-code/' },
    ]);
  });

  it('shows the revised date and confidence when present', () => {
    const rows = postMeta({ data: { ...base, revised: '2026-11-20', confidence: 'Opinion, lightly held' } }, 3);
    expect(rows[2].value).toBe('2026-11-20');
    expect(rows.at(-1)).toEqual({ label: 'Confidence', value: 'Opinion, lightly held' });
    expect(rows).toHaveLength(6);
  });

  it('treats an undefined revised date like a missing one', () => {
    const { revised: _, ...noRevised } = base;
    expect(postMeta({ data: noRevised }, 1)[2].value).toBe('—');
  });

  it('shows a dash and no links when there are no tags', () => {
    const filedUnder = postMeta({ data: { ...base, tags: [] } }, 1)[4];
    expect(filedUnder).toEqual({ label: 'Filed under', value: '—' });
  });
});
