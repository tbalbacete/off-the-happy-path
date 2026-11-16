# Progress

**Current milestone:** M7 - Dark theme
**Status:** IN PROGRESS   <!-- IN PROGRESS | BLOCKED | COMPLETE -->
**Kickoff:** docs/kickoffs/M7-kickoff.md
**Branch:** `feature/darkTheme`

M0's to M6's records are in git history (`progress.md` as of commits 084f458, 9406219, ef48ec2, b8c049f, fe98946, ffa3d0d and 65a223b).

## Done-when checklist
- [ ] With no stored choice, every page matches the reader's system setting in Chrome, Safari and Firefox, including with JS disabled, where the toggle doesn't appear - verified by:
- [ ] The toggle switches the theme, exposes its state correctly (`aria-pressed`, visible label), is keyboard reachable in reading order with the `--pen` outline, and works with Enter and Space - verified by:
- [ ] A stored choice survives reload and navigation with no flash of the wrong theme - verified by:
- [ ] With `localStorage` blocked, pages load without errors, follow the system, and the toggle still flips the current page - verified by:
- [ ] Every text/background pair passes 4.5:1 in both themes, and no hard-coded color is left in `src/` outside the token blocks - verified by:
- [ ] Code blocks, stamps, sidenotes, `<mark>`, the featured title, the masthead cells, the CURRENTLY bar, the share strip and both buttons follow §6 in both themes at 1280 and 360px - verified by:
- [ ] Print is light regardless of theme - verified by:
- [ ] Every page makes only same-origin requests on load in both themes, and the scripts are only the ones listed under Constraints - verified by:
- [ ] Lighthouse still scores 100 for accessibility and best practices and 95+ for performance (median of three) on home and № 002, mobile and desktop, in both themes - verified by:
- [ ] Tests pass for the theme-resolution logic, the script/function parity check, the matching token blocks, and the extended contrast test. CI is green on the PR - verified by:
- [ ] progress.md is complete and status is COMPLETE - verified by:

## Completed
- Branch `feature/darkTheme` created from `main` at d979126. The kickoff is committed on it.
- Needs Tony, answered before the start: `<mark>` and the featured title keep the highlighter band with light text in dark (option A, "light mode but inverse"). The toggle's label is "Dark theme" with `aria-pressed`.

## Decisions

## Deviations / deferred

## Known issues
- This machine's default shell Node is 22. The repo needs 26 (`.nvmrc`); run `nvm use` first.

## Plan changes to consider
- Carried from M6: the share links were checked signed out only, and COPY LINK hasn't been clicked in real Safari and Firefox. The production link-preview check of a post card waits on Tony.
- Carried from M5: the checking scripts live in the session scratchpad. If they're wanted again, they're worth moving into `scripts/` as a single `npm run verify-site`.
- Open from M4: a tag named like a page ("notes", "archive") would duplicate that page's `<title>`.

## Notes for the next kickoff
