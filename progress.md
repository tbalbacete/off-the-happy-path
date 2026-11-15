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
- `templates/post.md` and `scripts/lib/template.mjs` (`fillTemplate`, `templateValues`, `parseTags`, `parseType`, `yamlString`). Checked by hand: a filled draft passes `npm run check` and the build skips it; the same file with `draft: false` and a footnote built to `/log/probe/` with the title escaped correctly and none of the reminder text in the HTML.
- `scripts/new-post.mjs` as `npm run new` (flags or prompts) and `createPost` / `listPosts` / `titleProblem` / `existingTags` in `scripts/lib/workflow.mjs`. Tried by hand: flags (`--type rant --tags "process, Meetings" --dek 'Say "no": twice.'` → `003-…md` with `tags: [process, meetings]` and the dek escaped); a duplicate slug, `--type blog` and an unknown `--tag` flag each exit 1 and write nothing; piped answers re-ask on a taken slug, an empty title and a bad type; driven through a real TTY with `expect` (`Café déjà vu` → `005-cafe-deja-vu.md`, default type essay, existing tags listed); Ctrl-C exits 130 with nothing written. The created drafts passed `npm run check` and the build skipped them.
- `scripts/publish-post.mjs` as `npm run publish` and `publishPost` in `workflow.mjs`. Tried by hand on a throwaway `003-publish-probe.md`: `--keep-date` kept `2026-10-01` and the page built to `dist/log/publish-probe/`; without it the date became `2026-11-14`; with `tags: [Bad Tag]` it printed the schema error, `npm run check failed … was restored`, exited 1, and the file's SHA-1 was unchanged; Ctrl-C during the build (via `expect`) printed `Interrupted … was restored`, exited 1, SHA-1 unchanged; an unknown number and a missing argument exit 1 with a message.
- `tests/scripts-integration.test.ts`: new then publish against a temp folder seeded with copies of the two sample posts and the real template. Covers numbering after existing posts (003, then 004), duplicate-title refusal, a failed verify leaving the file byte-identical, publish by `003` changing only the `date:` and `draft:` lines, `keepDate`, and that the real posts folder is untouched. Its stand-in for check + build applies the site's own `assertUniqueEntries`, `rawDateProblems`, `isDateString` and the tag/type rules.
- `README.md`: setup, the day-to-day loop (new, dev, publish, commit, push), flags, editing a published post with `revised:`, the checks, and where the plan and progress files live.
- Vercel project imported by Tony (preset Astro, no environment variables). Production is `https://off-the-happy-path.vercel.app`, and `site` in `astro.config.mjs` is set to it. Before this branch, production already served `main` with only № 001 listed.

## Decisions
- **One slug rule, imported rather than copied.** `scripts/lib/slug.mjs` imports `slugFromId` from `src/lib/entries.ts`. That file uses only erasable TypeScript, so Node 26 runs it natively with type stripping, Vitest handles it, and `astro check` accepts the `.ts` import (`allowImportingTsExtensions` is on in Astro's base tsconfig). A test asserts the scripts' `slugFromId` is the very same function the site uses.
- **`// @ts-check` on every script file**, so `npm run check` type-checks the scripts' JSDoc (confirmed by planting a bad call and seeing `astro check` fail).
- **`nextEntryNumber` counts both the frontmatter `no` and the file name prefix**, so a file whose prefix and `no` disagree can never lead to a collision.
- **Template reminders are YAML comments inside the frontmatter**, not HTML comments in the body. An HTML comment survives into the built HTML; a frontmatter comment can never render. The body starts empty.
- **Placeholders cover the fields the script fills** (`no`, `title`, `dek`, `type`, `date`, `tags`, `draft`). `revised:` is written blank (the schema allows null), and `confidence` is a commented example, because a blank `confidence:` would be null and fail the schema.
- **A skipped dek becomes `"TODO: one or two sentences for the home page."`**, because the schema requires a non-empty dek and a fresh draft must build. `publish` refuses a post whose dek is still that placeholder.
- **Titles and deks are written as JSON strings** (valid YAML double-quoted), so quotes, colons and backslashes are safe. Tags are slugified, so `Code Review` becomes `code-review`.
- **File I/O for new and publish lives in `scripts/lib/workflow.mjs`** with the posts folder passed in, so tests run it against a temp directory. The scripts only parse flags, prompt, and print.
- **Prompts read lines from readline's async iterator** instead of `rl.question`, so the same code works in a terminal and with piped answers (piped lines can be lost with `rl.question`). Bad answers (taken slug, unknown type, empty title) are asked again; Ctrl-C or end of input exits without writing.
- **`publish` restores in a `finally`**, so the original text goes back if verify fails, throws, or is interrupted. While check and build run, it catches SIGINT (the child still gets it and stops) so the parent lives long enough to restore.
- **`publish` accepts an already-published post** and just re-dates it (or does nothing with `--keep-date`), and says so. Useful if a publish needs redoing; nothing in the plan rules it out.
- **Node 26 on Vercel needs no change.** Vercel lists 26.x (the default for new projects), 24.x and 22.x, and a `>=26` range resolves to 26 ([Vercel docs](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions)). `engines.node` stays `>=26`.
- **The printed commit message is `Entry NNN`**, as in plan §5. The title isn't put in the shell command, so quotes in a title can't break it.

## Deviations / deferred

## Known issues
- This machine's default shell Node is 22.12 (nvm default). The repo needs 26 (`.nvmrc`); run `nvm use` first. Node 22 can't import the `.ts` slug rule from the scripts.

## Plan changes to consider

## Notes for the next kickoff
