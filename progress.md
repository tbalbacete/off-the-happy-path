# Progress

**Current milestone:** M1 - New-post workflow and live deploy
**Status:** IN PROGRESS   <!-- IN PROGRESS | BLOCKED | COMPLETE -->
**Kickoff:** docs/kickoffs/M1-kickoff.md
**Branch:** `feature/newPostWorkflow` (local, not pushed)

M0's record is in git history (`progress.md` as of commit 084f458).

## Done-when checklist
- [ ] `npm run new` creates a correctly numbered and slugged draft from the template, both interactively and with flags, and refuses a duplicate slug
- [ ] `npm run publish -- <n>` flips the draft, sets the date (or keeps it with `--keep-date`), and runs check and build; on failure it exits non-zero and leaves the post unchanged
- [ ] The site is live on a `vercel.app` URL, and `site` in `astro.config.mjs` is set to it
- [ ] A post created with `npm run new` and published with `npm run publish` appears on the live site after it reaches `main`
- [ ] `README.md` covers the day-to-day loop
- [ ] Tests for the new behavior pass: unit tests for every `scripts/lib` helper, and the temp-directory integration test for new and publish; CI is green on the PR
- [ ] progress.md is complete and status is COMPLETE

## Completed
- `scripts/lib/slug.mjs`: `slugify` (NFKD + a small map for letters like ß/æ/ø/ł, apostrophes dropped, hyphens, cut at 60 on a word boundary), `postFileName`, and `slugFromId` re-exported from `src/lib/entries.ts`.
- `scripts/lib/dates.mjs`: `today()` from local date parts.
- `scripts/lib/entries.mjs`: `nextEntryNumber`, `findPost` (`16`, `016`, `the-slug`, `016-the-slug`), and file name helpers.
- `scripts/lib/frontmatter.mjs`: `readFrontmatter` (the small YAML subset posts use) and `setField` / `setDraft` / `setDate`, which rewrite only the one line and keep spacing, trailing comments, quote style and CRLF.

## Decisions
- **One slug rule, imported rather than copied.** `scripts/lib/slug.mjs` imports `slugFromId` from `src/lib/entries.ts`. That file uses only erasable TypeScript, so Node 26 runs it natively with type stripping, Vitest handles it, and `astro check` accepts the `.ts` import (`allowImportingTsExtensions` is on in Astro's base tsconfig). A test asserts the scripts' `slugFromId` is the very same function the site uses.
- **`// @ts-check` on every script file**, so `npm run check` type-checks the scripts' JSDoc (confirmed by planting a bad call and seeing `astro check` fail).
- **`nextEntryNumber` counts both the frontmatter `no` and the file name prefix**, so a file whose prefix and `no` disagree can never lead to a collision.

## Deviations / deferred

## Known issues
- This machine's default shell Node is 22.12 (nvm default). The repo needs 26 (`.nvmrc`); run `nvm use` first. Node 22 can't import the `.ts` slug rule from the scripts.

## Plan changes to consider

## Notes for the next kickoff
