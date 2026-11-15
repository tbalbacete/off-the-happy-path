# M1: New-post workflow and live deploy - Kickoff

## Goal
Make publishing a matter of one command to start a post, one to publish it, and a push to `main`, and get the site live on a free `vercel.app` URL.

## Starting point
M0 is complete and merged (PR #1). From progress.md:
- Astro 7 on Node 26 (`.nvmrc` = `26`, `engines.node` = `>=26`), TypeScript strict, static output, zero client JS.
- `posts` collection with a strict schema. The build fails on a bad field, an impossible date (raw-text check in the loader, because YAML rolls dates over), a duplicate `no`, or a duplicate slug.
- Entry file is `src/content/posts/NNN-<slug>.md`. The loader id is the file name; the URL slug is `slugFromId(id)` (everything after the first `<digits>-`).
- Helpers in `src/lib`: `posts.ts` (draft rule, newest first), `entries.ts` (`slugFromId`, `formatEntryNo`, `assertUniqueEntries`), `dates.ts` (`isDateString`, `toDateString`, `rawDateProblems`), `reading-time.ts`. 24 Vitest tests.
- Sample posts `001-hello-log.md` (published) and `002-draft-example.md` (draft).
- GitHub Actions CI (`.github/workflows/ci.yml`) runs `npm ci`, `check`, `test`, `build` on every PR and push to `main`.
- No `site` in `astro.config.mjs` yet.

## In scope
- `scripts/lib/` pure helpers, plain `.mjs` with JSDoc types:
  - `slugify(title)`: lowercase, ASCII (strip diacritics), hyphens, no leading or trailing hyphen, cut at about 60 characters on a word boundary.
  - `nextEntryNumber(files)`: highest existing `no` + 1, drafts included; 1 for an empty folder.
  - Frontmatter read and write: read fields from a post, and set `draft` and `date` by editing only those lines, leaving every other line (comments, quoting, order, body) untouched.
  - `today()`: the local date as `YYYY-MM-DD`.
  - Finding a post by slug or entry number (`16`, `016` and `the-slug` all work).
- `templates/post.md`: a Markdown file with `{{placeholders}}` for every frontmatter field, plus short comments showing sidenote (`[^1]`), highlighter (`<mark>`) and code-title syntax. A template comment must not appear in the rendered post.
- `scripts/new-post.mjs` as `npm run new` (plan §5):
  - Interactive with Node `readline`: prompts for title, type (essay / note / rant, default essay), tags (comma-separated, lists the existing tags) and dek (optional).
  - Non-interactive with flags: `npm run new -- "Title" --type rant --tags process,meetings --dek "..."`.
  - Writes `src/content/posts/<NNN>-<slug>.md` with `draft: true` and today's date. Refuses an existing slug or entry number and writes nothing.
  - Prints the file path and `http://localhost:4321/log/<slug>/`.
- `scripts/publish-post.mjs` as `npm run publish -- <slug-or-number>`:
  - Sets `draft: false` and `date` to today, or keeps the existing date with `--keep-date`.
  - Runs `npm run check` and `npm run build`. If either fails, the exit code is non-zero and the post is restored to how it was.
  - Prints the `git add` / `commit` / `push` commands. Never runs git itself.
- Tests in `tests/`: unit tests for each `scripts/lib` helper, plus an integration test that runs the new and publish logic against a temp directory (no real `src/content/posts`, no real build in the test).
- Vercel: Tony imports the repo in Vercel (framework preset Astro). Set `site` in `astro.config.mjs` to the production URL.
- `README.md`: a short guide to the day-to-day loop (new, dev, publish, commit, push), editing a published post (`revised:`), and where the plan and progress files live.

## Out of scope (do not build)
- Any page design: masthead, stamps, aside, sidenote rendering, code boxes, `<mark>` styling beyond M0 (M2, M3).
- Tag pages, type filter pages, archive, RSS, sitemap, About, 404, meta and OG tags (M4). Setting `site` now is only so M4 has it.
- Custom domain, analytics, Vercel Web Analytics or Speed Insights (never enable these).
- A web editor, CMS, or any git automation in the scripts.
- Removing the sample posts (M5).

## Carry-over from M0
- Keep one slug rule. The file name is `NNN-<slug>.md` and the slug is everything after the first `<digits>-`, exactly as `slugFromId` does. Either import the shared logic from `src/lib` if that works cleanly from `.mjs`, or duplicate it in `scripts/lib` with tests that pin the same behavior. Record which choice you made under Decisions.
- `npm run check` and `npm run build` already fail on bad frontmatter, impossible dates and duplicates, so `publish` relies on them rather than re-validating.
- Plan changes flagged in M0 but not yet applied to `docs/plan.md`: the URL slug comes from the file name; impossible unquoted dates are caught by a raw-text check; CI exists. Leave the plan alone unless Tony asks; just keep these true.
- Optional: Astro's anonymous build telemetry is on locally. CI already disables it. Setting `ASTRO_TELEMETRY_DISABLED=1` in Vercel's environment is fine but not required.

## Constraints
- Branch: work on `feature/newPostWorkflow`, created from an up-to-date `main`. One commit per logical step, each passing `npm test`, `npm run check` and `npm run build` (CLAUDE.md, Branches and commits).
- Scripts use Node built-ins only (`node:fs`, `node:path`, `node:readline`, `node:util` `parseArgs`, `node:child_process`). No new runtime or CLI dependencies.
- Pure logic lives in `scripts/lib` with tests. The two scripts only parse input, call helpers, do I/O and print.
- Dates are plain `YYYY-MM-DD` strings. `today()` must use the local calendar date (`getFullYear` / `getMonth` / `getDate`), never `toISOString()`, which gives tomorrow's date in the evening west of UTC.
- Never re-serialize a whole post's frontmatter. Change only the `draft:` and `date:` lines, so hand-written formatting and comments survive.
- New posts must pass the M0 schema as written: quoted title and dek, a lowercase-slug `tags` list, no unknown keys. A freshly created draft must build.
- Scripts never touch git, and never overwrite an existing post.
- The site stays static with zero client JS and no third-party scripts.

## Done when
- [ ] `npm run new` creates a correctly numbered and slugged draft from the template, both interactively and with flags, and refuses a duplicate slug
- [ ] `npm run publish -- <n>` flips the draft, sets the date (or keeps it with `--keep-date`), and runs check and build; on failure it exits non-zero and leaves the post unchanged
- [ ] The site is live on a `vercel.app` URL, and `site` in `astro.config.mjs` is set to it
- [ ] A post created with `npm run new` and published with `npm run publish` appears on the live site after it reaches `main`
- [ ] `README.md` covers the day-to-day loop
- [ ] Tests for the new behavior pass: unit tests for every `scripts/lib` helper, and the temp-directory integration test for new and publish; CI is green on the PR
- [ ] progress.md is complete and status is COMPLETE

## Needs Tony
- **Vercel import:** creating the Vercel project needs Tony's account. Ask him to import the repo (framework preset Astro, no environment variables), then use the URL Vercel assigns.
- **Node 26 on Vercel:** Vercel reads `engines.node`. If its supported Node versions don't include 26, make the smallest workable change (e.g. widen `engines` to the newest version Vercel supports while keeping `.nvmrc` at 26 locally), record it under Decisions, and flag it under Plan changes to consider.
- **Reaching `main`:** under the branch rules, the agent never merges. Check the script-created post on the branch's Vercel preview URL first. The production check (the post on the `vercel.app` URL after it reaches `main`) happens once Tony merges the PR. Record both.

## Suggested order of work
1. Create `feature/newPostWorkflow` from `main`. Reset progress.md for M1 using this kickoff's Done-when list (M0's record stays in git history).
2. `slugify`, `nextEntryNumber`, `today`, and the post lookup in `scripts/lib`, test-first. Settle the shared-slug-rule decision.
3. Frontmatter read and line-level edit helpers, test-first.
4. `templates/post.md` and the template fill helper; confirm a filled template passes `npm run check` and builds.
5. `scripts/new-post.mjs` with flags, then interactive prompts; wire `npm run new`.
6. `scripts/publish-post.mjs` with `--keep-date`, check and build, and restore on failure; wire `npm run publish`.
7. The temp-directory integration test for new and publish.
8. `README.md`.
9. Ask Tony to import the repo into Vercel; set `site`; resolve the Node version if needed.
10. Create and publish one post with the scripts, push the branch, check the preview URL, open the PR, and record what's left for after Tony merges.
11. Verify every Done-when item, record how in progress.md, and set status COMPLETE.
