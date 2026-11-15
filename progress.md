# Progress

**Current milestone:** M5 - Polish and launch
**Status:** IN PROGRESS   <!-- IN PROGRESS | BLOCKED | COMPLETE -->
**Kickoff:** docs/kickoffs/M5-kickoff.md
**Branch:** `feature/polishAndLaunch`

M0's to M4's records are in git history (`progress.md` as of commits 084f458, 9406219, ef48ec2, b8c049f and fe98946).

## Done-when checklist
- [ ] Lighthouse scores 100 for accessibility and best practices and 95+ for performance (median of three) on the home page and a post page, mobile and desktop, against `astro preview`. Record the numbers. After the merge, the same run against production when Tony asks.
- [ ] Every page type is usable by keyboard alone: skip link first and working, visible `--pen` focus on every focusable element, logical order, scrollable code boxes reachable. Verified by tabbing in the browser and recorded with screenshots of the focus states.
- [ ] Posts print cleanly: no nav, reply box, prev/next or sidenotes; end notes, title, meta and article present; code wraps; external links show their URLs. Verified with print-emulation screenshots and a PDF.
- [ ] No sample posts in production: № 002, № 003 and № 004 are deleted, the built HTML, feed and sitemap contain none of them, and `npm run links` passes.
- [ ] The Currently box carries Tony's real values, the About page keeps its approved copy, and no bracketed placeholder text is left anywhere in `src` or `dist`.
- [ ] `/about/` has the "On AI" section with Tony's approved wording, and every page's footer links to `/about/#on-ai`. The link resolves (`npm run links`) and the footer reads well at 1280, 390 and 360px.
- [ ] The design-rules checklist from plan §6 is filled in page by page in progress.md, with how each cell was checked, and every failure fixed or recorded as a decision.
- [ ] Every page makes only same-origin requests, and the M4 page audit passes again on every built page.
- [ ] The first real entry (№ 002, the requirements rant) follows the tone rules above, uses a code box, a sidenote and one `<mark>`, has Tony's explicit sign-off, is published with `npm run publish` on this branch, and is live on production after the merge.
- [ ] The production feed passes the W3C Feed Validator and the OG image shows in a link-preview check (after the merge, when Tony asks; record the result).
- [ ] Tests pass for any new logic. CI is green on the PR.
- [ ] progress.md is complete and status is COMPLETE.

## Completed
- Branch `feature/polishAndLaunch` created from `main` at b4cb250.

## Decisions

## Deviations / deferred

## Known issues
- This machine's default shell Node is 22. The repo needs 26 (`.nvmrc`); run `nvm use` first.

## Plan changes to consider

## Notes for the next kickoff
