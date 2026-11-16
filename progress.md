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

- `src/lib/theme.ts`: `parseStoredTheme` (only `light`/`dark`, anything else is no choice), `resolveTheme(stored, systemPrefersDark)`, `otherTheme`, `readStoredTheme`/`writeStoredTheme` (take a storage getter, try/catch, so a blocked `localStorage` reads as no choice and a write reports false), the constants `THEME_STORAGE_KEY` (`theme`) and `THEME_ATTRIBUTE` (`data-theme`), and `themeHeadScript`, the inline `<head>` script as a string built from those constants. Tests in `tests/theme.test.ts` run the script string in `node:vm` against stub `localStorage` and `document`, and check it gives the same result as `readStoredTheme` for every valid and junk value and for blocked storage (a throwing getter and throwing methods). 285 tests.
- Dark tokens in `global.css`: `@media screen and (prefers-color-scheme: dark) { :root:not([data-theme='light']) {…} }` and `@media screen { :root[data-theme='dark'] {…} }`, with the §6 values, `color-scheme: dark` (and `color-scheme: light` in `:root`). Two new roles, `--on-highlighter` and `--on-highlighter-muted`, carry the text color on the highlighter: ink and pencil in light, `#161614` and `#55534d` (light pencil) in dark. The `--code-*` variables moved from `:root` onto `.code-box` and are declared again on `.line.highlighted`, which sets `--ink`/`--pencil` to the on-highlighter values, so highlighted code lines get dark text without naming a color. `tests/contrast.test.ts` now parses the three token blocks (resolving `var()` inside each): the two dark blocks are equal, every token is overridden, the values are §6's, each block sets `color-scheme`, the dark rules are screen-only, and all six text/background pairs are at least 4.5:1 in both themes. A new "no hard-coded colors" check scans every `.astro`/`.css`/`.ts`/`.mjs` file in `src/` (posts excluded; `global.css` minus its token blocks) for hex, `rgb()`/`hsl()`-style functions and named colors in color properties. Planting `color: #fff`, `rgb(1 2 3)` and `border-color: white` in `Stamp.astro` each failed it. 347 tests.
- Browser check, JS off (system Chrome, `colorScheme` emulation, `astro preview`): all 12 pages at 1280 and 360 have `body` background `rgb(22, 22, 20)` and `color-scheme: dark` when the system is dark, and `rgb(242, 242, 238)`/`light` when it's light. `scrollWidth == clientWidth` everywhere. Screenshots of every page in dark: masthead, CURRENTLY bar (dark text on the light ink bar), stamps (RANT in pen), sidenotes in pen, the share strip's icons, the reply box and prev/next all follow the tokens. Highlighted code lines compute `rgb(22, 22, 20)` text on the highlighter.
- `<mark>` and the featured title (Tony's option A): unchanged CSS, so in dark the band sits under light text. Close-ups at 2×: the featured title reads cleanly. In body-size `<mark>` text the lower third of each letter is light on yellow, readable but softer than the rest of the line.

## Decisions
- **Print stays light by scoping the dark blocks to `@media screen`** rather than forcing light values in the print blocks. Nothing extra to maintain in either print block.
- **Parity between the inline script and the tested code:** only the `<head>` script has to be `is:inline`, so only it is a hand-written string. The tests execute that string rather than compare text. The toggle's script is an ordinary Astro `<script>` that imports `src/lib/theme.ts`, so it uses the tested functions directly.

## Deviations / deferred

## Known issues
- This machine's default shell Node is 22. The repo needs 26 (`.nvmrc`); run `nvm use` first.

## Plan changes to consider
- Carried from M6: the share links were checked signed out only, and COPY LINK hasn't been clicked in real Safari and Firefox. The production link-preview check of a post card waits on Tony.
- Carried from M5: the checking scripts live in the session scratchpad. If they're wanted again, they're worth moving into `scripts/` as a single `npm run verify-site`.
- Open from M4: a tag named like a page ("notes", "archive") would duplicate that page's `<title>`.

## Notes for the next kickoff
