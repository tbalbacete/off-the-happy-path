# Progress

**Current milestone:** M3 - Post page to design
**Status:** IN PROGRESS   <!-- IN PROGRESS | BLOCKED | COMPLETE -->
**Kickoff:** docs/kickoffs/M3-kickoff.md
**Branch:** `feature/postPageDesign`

M0's, M1's and M2's records are in git history (`progress.md` as of commits 084f458, 9406219 and ef48ec2).

## Done-when checklist
- [ ] The sample post (№ 004) matches the Post artboard at 1280px: compact header, kicker with stamp, title and dek, meta column, body type, code box with title, note and highlighted line, `<mark>`, sidenotes in the margin, reply box, prev/next, footer. It reads well at 390px and 360px with no horizontal scroll.
- [ ] On wide screens each sidenote's top sits level with its reference line, measured with the browser. On narrow screens the end notes show and the sidenotes don't, with no JS.
- [ ] Previous and next are correct at both ends of the log (№ 004, № 003, № 001 in the built HTML).
- [ ] The reply link is a `mailto:` to the real address with the subject `Re: № 004`.
- [ ] Code uses only token colors; `grep` over `src/` finds only the token declarations, with no `box-shadow`, `border-radius` or gradient.
- [ ] No client JS: built pages contain no `<script>` and `dist` contains no `.js` files.
- [ ] Landmark and contrast checks pass on every built post page.
- [ ] Tests pass for the new behavior: sidenote plugin cases, `prevNext`, `replyHref`, `postMeta`, `parseCodeMeta`. CI is green on the PR.
- [ ] progress.md is complete and status is COMPLETE.

## Completed

## Decisions

## Deviations / deferred

## Known issues
- This machine's default shell Node is 22. The repo needs 26 (`.nvmrc`); run `nvm use` first.

## Plan changes to consider

## Notes for the next kickoff
