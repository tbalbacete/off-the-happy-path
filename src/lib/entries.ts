/**
 * Pure helpers about entry identity (number and slug). No Astro imports, so
 * the content loader can use them at config time.
 */

/** `001-hello-log` (file id) -> `hello-log` (URL slug). */
export function slugFromId(id: string): string {
  return id.replace(/^\d+-/, '');
}

/** `001-hello-log` (file id) -> `/log/hello-log/` (the post's page). */
export function postHref(id: string): string {
  return `/log/${slugFromId(id)}/`;
}

/** 7 -> `007`. */
export function padEntryNo(no: number): string {
  return String(no).padStart(3, '0');
}

/** 7 -> `№ 007`. */
export function formatEntryNo(no: number): string {
  return `№ ${padEntryNo(no)}`;
}

export interface EntryIdentity {
  id: string;
  no: number;
}

/**
 * Throw a readable error if two entries share an entry number or a slug.
 * Called by the posts loader so a duplicate fails the build.
 */
export function assertUniqueEntries(entries: EntryIdentity[]): void {
  const problems: string[] = [];

  const byNo = new Map<number, string[]>();
  const bySlug = new Map<string, string[]>();
  for (const { id, no } of entries) {
    byNo.set(no, [...(byNo.get(no) ?? []), id]);
    const slug = slugFromId(id);
    bySlug.set(slug, [...(bySlug.get(slug) ?? []), id]);
  }

  for (const [no, ids] of byNo) {
    if (ids.length > 1) {
      problems.push(`Entry number ${no} is used by more than one post: ${ids.sort().join(', ')}`);
    }
  }
  for (const [slug, ids] of bySlug) {
    if (ids.length > 1) {
      problems.push(`Slug "${slug}" is used by more than one post: ${ids.sort().join(', ')}`);
    }
  }

  if (problems.length > 0) {
    throw new Error(
      `Duplicate posts in src/content/posts:\n  - ${problems.join('\n  - ')}\n` +
        'Each post needs a unique `no` and a unique slug (the file name after the number).',
    );
  }
}
