# Progress

**Current milestone:** M2 - Home page to design
**Status:** IN PROGRESS   <!-- IN PROGRESS | BLOCKED | COMPLETE -->
**Kickoff:** docs/kickoffs/M2-kickoff.md
**Branch:** `feature/homePageDesign`

M0's and M1's records are in git history (`progress.md` as of commits 084f458 and 9406219).

## Done-when checklist
- [ ] The home page matches the Home artboard at 1280px and reflows cleanly at 390px and 360px with no horizontal scroll (screenshots compared against the artboard).
- [ ] `/type/essay/`, `/type/note/` and `/type/rant/` all build and list only posts of that type, with the right filter marked active. An empty type shows its empty line.
- [ ] The Currently box reads from `src/data/currently.ts`, and all other site text from `src/data/site.ts`.
- [ ] No client JS: built pages contain no `<script>` and `dist` contains no `.js` files.
- [ ] Contrast and landmark checks pass: the contrast test covers every text and background pair in use, and the built HTML has exactly one each of `header`, `main`, `footer`, a labelled `nav` and an `aside`.
- [ ] The design rules hold: only the five colors plus the hairline appear in the CSS, and there are no `box-shadow`, `border-radius` or gradients (`grep` over `src/`).
- [ ] Tests for the new behavior pass: unit tests for `homeEntries`, `postsOfType`, `tagLabel`, `tagCounts`, `entryMeta` and `contrastRatio`. CI is green on the PR.
- [ ] progress.md is complete and status is COMPLETE.

## Completed
- `src/lib/home.ts`: `POST_TYPES`, `homeEntries` (featured, next `count - 1` rows, and the `{ from, to }` entry-number range of the rest, or null), `postsOfType`, `entryMeta`. `src/lib/tags.ts`: `tagLabel`, `tagCounts` (most used, then alphabetical; a tag counts once per post). `padEntryNo` added to `entries.ts` for the older-entries range. Tests in `tests/home.test.ts`, `tests/tags.test.ts` and `tests/entries.test.ts`.
- `src/lib/contrast.ts`: `relativeLuminance` and `contrastRatio` (WCAG 2). `tests/contrast.test.ts` reads the tokens from `global.css` and checks every pair in use: ink, pencil and pen on paper, paper on ink (the CURRENTLY bar), and ink on highlighter (the featured title band).

## Decisions
- **`homeEntries` reads the older range from entry numbers, not positions**, so gaps (a removed post) still give the right `(008–001)`-style label.

## Deviations / deferred

## Known issues
- This machine's default shell Node is 22.12. The repo needs 26 (`.nvmrc`); run `nvm use` first.

## Plan changes to consider

## Notes for the next kickoff
