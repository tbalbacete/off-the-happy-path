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
- Tony's answers (asked at the start): the rant opens on a composite: a ticket that is only a title with no description, created six months ago, and when you ask, nobody really knows what the work is. Costs to lean on: rework, and burnout / morale. What has worked: asking early, and time in planning. Title: "The time we didn't save". Nothing off-limits beyond the kickoff's tone rules. The "On AI" wording is approved as written in the kickoff. The `ai` tag drops its comma: Tony chose "drop the comma" without a new name, so it is "AI (honestly)" (see Decisions).
- Skip link: "Skip to content" (`site.skipLink`) is the first element in `BaseLayout`'s `body`, linking to `#main`; every page's `main` now has `id="main"` (home and type pages had `id="log"`, which nothing linked to). Off screen until `:focus-visible`, then a mono uppercase label on paper in a 2px ink box at the top left.
- Keyboard pass (playwright-core, system Chrome, `astro preview`): tabbed through home, `/type/note/`, № 004, `/tag/process/`, `/archive/`, `/about/` and the 404 at 1280 and 390. On every page the first stop is the skip link, and Enter then Tab lands inside `main`; every stop is visible and has a `solid 2px rgb(179, 25, 15)` outline; no stop jumps back up the page (home: skip link, masthead name, nav, filters, featured title and READ ENTRY, rows, tags, the aside's email link, RSS / GitHub / Email). № 004's code box (`pre tabindex="0"`) is a tab stop after the article's links, with no clipping ancestor. Screenshots of the focus states (skip link, nav, filter, featured title on the highlighter, aside tag and link, prev/next cell, meta tag, reply link, footnote reference, code box) show the outline whole. No focus fixes were needed.
- Lighthouse baseline (13.6.0 in the scratchpad, system Chrome headless, `astro preview`; default mobile config and `--preset=desktop`; three runs each): home, `/type/note/` and № 004 all scored performance 100/100/100, accessibility 100 and best practices 100, mobile and desktop. Medians: LCP 0.75 s mobile / 0.20 s desktop, TBT 0 ms, CLS at most 0.005 except № 004 desktop at 0.052 (the web fonts swapping in; under the 0.1 threshold). Nothing needed fixing, so font loading is unchanged.

## Decisions
- **`ai` displays as "AI (honestly)".** Tony chose to drop the comma but didn't name a replacement; parentheses keep the voice without the comma clash in tag lists. One line in `site.tagNames` to change.

## Deviations / deferred

## Known issues
- This machine's default shell Node is 22. The repo needs 26 (`.nvmrc`); run `nvm use` first.

## Plan changes to consider

## Notes for the next kickoff
