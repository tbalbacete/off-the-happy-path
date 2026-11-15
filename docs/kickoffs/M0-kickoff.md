# M0: Running skeleton - Kickoff

## Goal
Get a working Astro project that builds, tests, and renders Markdown posts from a validated content collection, so every later milestone has a solid base.

## Starting point
Empty repo containing only `CLAUDE.md`, `progress.md`, `docs/plan.md`, and `docs/kickoffs/`.

## In scope
- Astro project (latest stable), TypeScript strict, static output. Folder layout per plan §3, creating only the folders this milestone uses (`src/content/posts`, `src/lib`, `src/pages`, `src/layouts`, `src/styles`, `src/data`, `tests`).
- `.nvmrc` with current Node LTS, plus `engines` in `package.json`.
- `@fontsource` packages for Archivo (variable, with width axis), Source Serif 4 (variable), and IBM Plex Mono (400/500/600), imported once in the base layout.
- `src/styles/global.css` with the five color tokens, the hairline color, font-family tokens, and base body typography (plan §6).
- `src/data/site.ts` with name ("Off the Happy Path"), author ("Tony Albacete"), tagline, and placeholder email and links.
- `src/content.config.ts`: `posts` collection with the full frontmatter schema from plan §4 (`no`, `title`, `dek`, `type` enum, `date` as a `YYYY-MM-DD` string, optional `revised`, `tags`, optional `confidence`, `draft`).
- A build-time check that fails with a clear message on a duplicate `no` or slug.
- `src/lib/posts.ts`: get posts, exclude drafts in production builds (include them in dev), sort newest first (by `no` descending).
- `src/lib/reading-time.ts`: about 230 wpm, rounded up, minimum 1.
- Two sample posts in `src/content/posts/`: `001-hello-log.md` (published) and `002-draft-example.md` (draft).
- `BaseLayout` with `lang="en"`, fonts, and global CSS.
- `src/pages/index.astro`: a plain list of published entries (`№ NNN`, date, title linking to the post). No design yet.
- `src/pages/log/[slug].astro`: renders title, date, reading time, and the Markdown body. No design yet.
- Vitest configured, with tests for sorting, draft filtering, and reading time.
- npm scripts: `dev`, `build`, `check` (`astro check`), `test` (`vitest run`).

## Out of scope (do not build)
- `npm run new` / `npm run publish` scripts and the post template (M1)
- Vercel deploy (M1)
- Any page design matching the canvas: masthead, stamps, aside, sidenotes, code boxes (M2, M3)
- Tags, type filters, archive, RSS, sitemap, About, 404, meta tags (M4)

## Carry-over from M-1
None.

## Constraints
- Static output only; no SSR adapter needed yet.
- Zero client JS.
- No remote font or script requests; fonts come from `@fontsource`.
- Dates are plain `YYYY-MM-DD` strings; never pass them through `new Date()` for display.
- The draft rule lives in one place: `src/lib/posts.ts`.
- Pure logic in `src/lib` with tests; pages only call helpers.
- Use the color tokens from plan §6 even in the bare pages (paper background, ink text).

## Done when
- [ ] `npm run dev` serves the home page and both sample posts; the draft appears only in dev
- [ ] `npm run build` succeeds and the built output excludes the draft
- [ ] `npm run check` passes
- [ ] `npm test` passes with tests for sorting, draft filtering, and reading time
- [ ] An invalid frontmatter field (and a duplicate `no`) fails the build with a clear message
- [ ] Tests for the new behavior pass
- [ ] progress.md is complete and status is COMPLETE

## Suggested order of work
1. Scaffold Astro (minimal template, TypeScript strict) and add `.nvmrc` and `engines`.
2. Add Vitest and an empty passing test; wire the npm scripts.
3. Write the content collection schema and the two sample posts.
4. Write `posts.ts` and `reading-time.ts` test-first.
5. Add the duplicate `no` / slug check and confirm it fails the build on purpose, then revert.
6. Add fonts, `global.css`, `site.ts`, and `BaseLayout`.
7. Build the bare home page and post route.
8. Verify every Done when item, record how in progress.md, and set status COMPLETE.
