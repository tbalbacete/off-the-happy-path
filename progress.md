# Progress

**Current milestone:** M0 - Running skeleton
**Status:** COMPLETE   <!-- IN PROGRESS | BLOCKED | COMPLETE -->
**Kickoff:** docs/kickoffs/M0-kickoff.md
**Branch:** `feature/runningSkeleton` (local, not pushed)

## Done-when checklist
- [x] `npm run dev` serves the home page and both sample posts; the draft appears only in dev - verified by: `astro dev --background`, then curl. `/`, `/log/hello-log/` and `/log/draft-example/` all returned 200. The home list showed № 002 (marked "(draft)") above № 001, and the draft page rendered its title, `№ 002 · 2026-11-14 · 1 min read · draft` and its body.
- [x] `npm run build` succeeds and the built output excludes the draft - verified by: the build generated only `/index.html` and `/log/hello-log/index.html`. `grep -rl draft-example dist` found nothing. The built pages have 0 `<script>` tags, there are 0 `.js` files in `dist`, and the HTML and CSS reference no remote URLs (the fonts are bundled in `dist/_astro`).
- [x] `npm run check` passes - verified by: `astro check` reported 0 errors, 0 warnings, 0 hints (16 files).
- [x] `npm test` passes with tests for sorting, draft filtering, and reading time - verified by: `vitest run` passed 4 files and 24 tests (`tests/posts.test.ts`, `reading-time.test.ts`, `entries.test.ts`, `dates.test.ts`).
- [x] An invalid frontmatter field (and a duplicate `no`) fails the build with a clear message - verified by: breaking a sample post on purpose, running `npm run build` (exit 1 each time), then restoring it:
  - `type: blog` → `[InvalidContentEntryDataError] posts → 001-hello-log … type: Invalid option: expected one of "essay"|"note"|"rant"`
  - typo `tag:` → `Unrecognized key: "tag"` (the schema is strict)
  - `date: "11/14/2026"` → `date: Must be a real date written as YYYY-MM-DD`
  - unquoted `date: 2026-02-30` / `2026-13-40` and `revised: 2026-11-31` → `Invalid dates in src/content/posts: - src/content/posts/001-hello-log.md → date: "2026-02-30" is not a real date written as YYYY-MM-DD`
  - a second post with `no: 1` → `Duplicate posts in src/content/posts: - Entry number 1 is used by more than one post: 001-hello-log, 003-another`
  - a second `…-hello-log.md` file → `Slug "hello-log" is used by more than one post: 001-hello-log, 009-hello-log`
- [x] Tests for the new behavior pass - verified by: same `npm test` run as above. Every commit on the branch was checked against just its staged files with `npm test` and `npm run build`, plus `npm run check` from the content step onward.
- [x] progress.md is complete and status is COMPLETE - verified by: this file.

## Completed
- Astro 7.4 (minimal template), TypeScript strict (`astro/tsconfigs/strict`), `output: 'static'`. `.nvmrc` = `26`, `engines.node` = `>=26`.
- npm scripts: `dev`, `build`, `preview`, `check`, `test`.
- Vitest 5 runs through `getViteConfig` so `astro:content` resolves in tests.
- `src/content.config.ts`: the `posts` collection with the full plan §4 schema (strict object). Its loader wraps `glob` and fails the build on duplicate `no`, duplicate slug, or an impossible raw date.
- `src/lib/posts.ts` (`filterDrafts`, the only place the draft rule lives; `sortNewestFirst`; `getPosts`). `src/lib/reading-time.ts` (230 wpm, rounded up, min 1). `src/lib/entries.ts` (`slugFromId`, `formatEntryNo`, `assertUniqueEntries`). `src/lib/dates.ts` (`isDateString`, `toDateString`, `rawDateProblems`). Each has tests.
- Fonts from `@fontsource-variable/archivo` (`wdth.css`, width axis 62–125%), `@fontsource-variable/source-serif-4` (wght + italic) and `@fontsource/ibm-plex-mono` (400/500/600), imported once in `BaseLayout`.
- `src/styles/global.css`: the five color tokens, `--hairline`, font tokens, base body type (Source Serif 17px / 1.6), Archivo condensed headings, `:focus-visible` in `--pen`.
- `src/data/site.ts`: name, author, tagline, placeholder email and link.
- Sample posts `001-hello-log.md` (published) and `002-draft-example.md` (draft). Bare `index.astro` and `log/[slug].astro`.

## Decisions
- **Moved `plan.md`, `M0-kickoff.md`, `_TEMPLATE.md` into `docs/` and `docs/kickoffs/`.** They were at the repo root, but CLAUDE.md, this file and plan §3 all expect `docs/`.
- **Node 26.** It is the current Active LTS (Node 24 is now in maintenance) and Astro 7 needs `>=22.23.4`.
- **Entry id = file name (`001-hello-log`), URL slug = `slugFromId(id)`.** If the slug were the loader id, two files with the same slug would silently overwrite each other in the store before any check could see them. The filesystem keeps file names unique, so the duplicate-slug check runs over derived slugs instead.
- **Duplicate check lives in a loader wrapper** around `glob`, so it runs at content sync and fails both `build` and `check`, even if no page queries the collection.
- **Raw-date check.** YAML turns an unquoted impossible date (`2026-02-30`) into a Date that has already rolled over to `2026-03-02`, so the Zod schema can't see the error. `rawDateProblems` reads the frontmatter text instead, and the loader runs it per file. Valid unquoted dates are normalised to strings in UTC by `toDateString`, so no timezone shift is possible.
- **Strict frontmatter schema** (`z.strictObject`), so a mistyped key such as `tag:` fails the build instead of being silently dropped.
- **Added `@types/node`** (dev). TS 6 / `astro check` needs it for the `node:fs/promises` import in the content config.
- **Branch and commit rules added to CLAUDE.md** at Tony's request: one branch per milestone, one commit per logical step, each commit verified.

## Deviations / deferred
- No `site` in `astro.config.mjs` yet (M1, with the Vercel URL).
- No favicon. The scaffold's Astro favicons were not copied, and a favicon from the OTHP mark is M5. Browsers will get a 404 for `/favicon.ico` until then.
- Fonts include every unicode subset fontsource ships (latin, latin-ext, cyrillic, greek, vietnamese). Browsers only download the subsets a page uses, so this costs nothing at runtime. Trimming to latin is an option for M5.

## Known issues
- Dev mode only: the page includes Astro's dev client `<script>` (dev toolbar / HMR). Built output has none.
- `npm install` warns that the `fsevents` install script was not run (npm's install-script approval). It is an optional macOS file-watcher dependency and dev works without it.

## Plan changes to consider
- Plan §3/§4: say explicitly that the URL slug is derived from the file name (not from a frontmatter field), which is what makes the duplicate-slug check possible.
- Plan §4: note that impossible unquoted dates are caught by a raw-text check, because YAML rolls them over.

## Notes for the next kickoff
- Branch for M1 from `main` after this branch is merged, e.g. `feature/newPostWorkflow`.
- `scripts/lib` helpers for M1 can reuse `slugFromId` / `formatEntryNo` / `isDateString` logic. Keep the rules identical: the file name is `NNN-<slug>.md` and the slug is everything after the first `<digits>-`.
- `npm run publish` should run `npm run check` and `npm run build`. Both already fail on bad frontmatter, duplicates and impossible dates.
- Astro's anonymous build telemetry is on by default (it reports nothing about readers). Run `astro telemetry disable` if you don't want it.
- Use `astro dev --background` / `astro dev stop` to drive the dev server from an agent session.
