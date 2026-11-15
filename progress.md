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

## Decisions

## Deviations / deferred

## Known issues

## Plan changes to consider

## Notes for the next kickoff
