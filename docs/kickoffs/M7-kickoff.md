# M7: Dark theme - Kickoff

## Goal
Give the site a dark theme, "carbon paper" rather than a black screen, using the palette in plan §6. By default readers get the theme their system asks for. A THEME button in the header lets them override it either way, and the choice survives reloads and navigation with no flash of the wrong theme. Readers without JS still follow their system setting. Components never name a color, so the dark theme is one block of token overrides in `global.css`.

## Starting point
M6 is complete and merged (PR #16), followed by the dark-theme plan (PR #17, `d979126`). From progress.md:
- Astro 7 on Node 26, TypeScript strict, static output. Live at `https://off-the-happy-path.vercel.app`; every push to `main` deploys. CI runs `check`, `test`, `build` and `links`. 262 Vitest tests.
- Published posts: № 002 "The time we didn't save" (rant) and № 001 "Hello, log" (note), each with its own OG card in `public/og/`.
- The only client JS is the COPY LINK script in `ShareBox.astro`, which sits in the share strip under the post title. Astro inlines it as a `<script type="module">` of 673 bytes. Every other page has no `<script>`.
- **Colors today:** the tokens live in `:root` in `src/styles/global.css` (`--paper`, `--ink`, `--pencil`, `--pen`, `--highlighter`, `--hairline`). No hex, `rgb()`, `white` or `black` appears in `src/` outside that block. The Shiki theme (`src/lib/code.ts`) is already `createCssVariablesTheme`, so its `--code-*` variables map onto the tokens and follow them.
- **Hard-coded colors outside `src/`:** `public/favicon.svg` (paper, ink, pen hexes), `public/og.png`, the post cards, and `design/og.html` / `scripts/lib/og-card.mjs`. These stay light per §6.
- **The highlighter today:** `.highlight` (the featured title on home) and `mark` are a thick `text-decoration` band over the lower third of the text, not a background. Highlighted code lines (`.code-box .line.highlighted`) do get a full `--highlighter` background, with code text in `--ink` and `--pencil`.
- **Headers:** `MainNav` (`nav aria-label="Main"`) is shared. Home and type pages render `Masthead` + `SiteNav` (tagline row + `MainNav`). Post, page, archive, tag, About and 404 pages render `SiteHeader` (name + `MainNav`).
- `tests/contrast.test.ts` reads the tokens out of `global.css`'s `:root` and checks every text/background pair the site uses at 4.5:1 or better.
- `PostLayout` and `global.css` each have an `@media print` block. No `color-scheme` or `theme-color` is set anywhere.

## Design reference
No new artboards. Plan §6's dark palette, applied to the existing components.

## In scope
- **Tokens.** Add the dark values from §6 as one block of overrides in `global.css`: under `:root[data-theme="dark"]`, and the same values under `@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { … } }`. Keep the values in one place. If CSS can't share them, add a test that the two blocks match. Set `color-scheme: light` / `dark` alongside each, so form controls and scrollbars match. Components keep using the tokens. No component gets its own dark rule unless it's on the highlighter (next bullet).
- **Text on the highlighter stays dark.** With `--ink` turning light, anything drawn on `--highlighter` would drop to about 1.2:1. Highlighted code lines must keep dark text (`#161614` in dark, ink as today in light). Suggested approach: re-scope the light text tokens locally on highlighter surfaces (e.g. `.line.highlighted { --ink: …; --pencil: …; }`, pointing at shared variables, not new hexes), so the code variables follow without extra rules. Record what was chosen.
- **`<mark>` and the featured title in dark** (see Needs Tony). The band covers only the lower third of the glyphs, so neither light nor dark text is fully readable across it on dark paper. Tony chose (A): keep the band with light text, as light mode inverted (see Needs Tony).
- **Theme resolution logic.** A pure function in `src/lib/theme.ts`, e.g. `resolveTheme(stored, systemPrefersDark) → 'light' | 'dark'`, plus `parseStoredTheme(raw)` that accepts only `'light'` / `'dark'` and treats anything else (null, junk, an old value) as "no choice". Export the storage key and attribute name as constants. Vitest tests cover every combination and junk input. Because the inline scripts can't import modules at runtime, keep each script's logic visibly identical to the tested function. Either generate the script text from the same source at build time, or add a test that compares the inline script against the function. Record which.
- **The `<head>` script.** A tiny blocking inline `<script is:inline>` in `BaseLayout`'s `<head>`, before the stylesheet if possible. It reads `localStorage` inside try/catch and, only if the stored value is valid, sets `data-theme` on `<html>`. With no stored choice it does nothing, and the media query handles it. That means no flash, and readers without JS behave the same as readers with no choice.
- **`ThemeToggle.astro`**, placed in both headers next to `MainNav` (not inside the `nav`'s list, since it isn't a link), so it appears on every page:
  - A mono uppercase button styled like COPY LINK: 2px ink border on paper, inverting on hover, no radius. It renders `hidden` and its script reveals it.
  - Label and pressed state: a single button with `aria-pressed="true"` when dark is on, and a visible label from `site.theme` (default "Dark theme"; see Needs Tony). On click: flip the current resolved theme, set `data-theme`, write the choice to `localStorage` in try/catch, update `aria-pressed`. If storage throws, the theme still flips for this page.
  - It follows the system while there's no stored choice. If the system changes mid-visit and there's no stored choice, the button's state follows (`matchMedia` change listener).
  - Small, no dependencies, no globals beyond what the head script needs. Record each script's size and whether Astro inlined it.
- **Check every surface in both themes:** masthead form cells (2px-gap ink background), stamps (RANT in pen), the CURRENTLY bar (paper on ink), sidenotes and end notes, code boxes and highlighted lines, `<mark>`, the featured title, the share strip and its icons (`currentColor`), COPY LINK and THEME buttons at rest, hover and focus, hairlines, focus outlines in `--pen`, the 404, the `::selection` default. The favicon is a self-contained paper square, so check that it reads on a dark browser tab and change it only if it doesn't.
- **Print is always light.** In the print blocks, force the light token values regardless of `data-theme` or system setting.
- **Contrast test.** Extend `tests/contrast.test.ts` to parse both token sets and check every pair in both themes, including dark text on the highlighter. Add a test that no hex/`rgb()`/named color appears in `src/` outside the token blocks.
- **README:** a line on the theme toggle and that the choice is stored only in the reader's browser.

## Out of scope (do not build)
- More than two themes, a "system" third state on the button, or a sepia or high-contrast variant.
- Dark OG cards, a dark `og.png`, or a dark print stylesheet.
- Cookies, server-side theme detection, or any request carrying the choice.
- Any client JS beyond the head script and the toggle script (plus the existing COPY LINK script on posts).
- The "Later" ideas in the plan (pre-publish checks, scheduled posts), a custom domain, search, comments, analytics.
- Moving the checking scripts into the repo (`npm run verify-site`). Recreate what this milestone needs in the scratchpad, and note it again under Plan changes to consider if still wanted.

## Carry-over from M6
- Run everything on Node 26 (`nvm use`); the default shell Node is 22. Check each pre-commit run by its exit code, never by piping into `grep`.
- Push with `gh` for that one command: `git -c credential.helper= -c 'credential.helper=!gh auth git-credential' push`. Don't change the git config.
- Browser checks: `playwright-core` in the session scratchpad, driving the system Chrome and Playwright's Firefox and WebKit builds against `astro preview` (real Safari and Firefox aren't automatable here; record that as before). Use `colorScheme: 'dark' | 'light'` emulation for the system setting, and `javaScriptEnabled: false` for the no-JS checks.
- Recreate the page audit with **one change to the script rule**: every page carries the head script and the toggle script; post pages also carry the copy-button script; no `.js` files in `dist`; no `<script src>`. The rest is unchanged: landmarks, one `nav aria-label="Main"` with one `aria-current="page"`, one `h1` first, no skipped headings, `lang="en"`, unique `<title>`, description, canonical/`og:url`, OG and Twitter tags, post `og:image` returning 200.
- Re-run the design-rules pass (token colors only, three fonts, no radius/shadow/gradient, nothing centered) **in both themes**.
- Plan changes still open from M6: the signed-in share-link check, a manual COPY LINK click in real Safari and Firefox, and the production link-preview check of a post card (when Tony asks). Not part of M7's Done when.
- Open from M4: a tag named like a page would duplicate that page's `<title>`. Still not in scope.

## Constraints
- **Five colors plus hairline, per theme.** Dark values exactly as in §6: `--paper #161614`, `--ink #ECEAE3`, `--pencil #A9A69C`, `--pen #F0675C`, hairline `#3B3A35`, `--highlighter #FFE14D` with `#161614` text on it. No new color.
- **No shadows, gradients or rounded corners.** Lines and boxes only, asymmetric, nothing centered but the container.
- **Storage:** one `localStorage` entry, read and written in try/catch, never sent anywhere. No cookies. Blocked storage falls back to the system setting.
- **Client JS:** the head script and the toggle script on every page, plus COPY LINK on posts. Inline, same-origin, no dependencies. Every page works with JS off.
- **No flash:** a stored choice that differs from the system must be applied before first paint.
- **Accessibility:** the toggle has a visible text label and `aria-pressed`, is in reading order, works with Enter and Space, and has the `--pen` focus outline in both themes. Text contrast ≥ 4.5:1 for every pair in both themes.
- **Responsive:** 1280, 390 and 360px in both themes, 16px gutters on phones, no horizontal scroll. The headers must still wrap cleanly with the button added.
- **Commits:** branch `feature/darkTheme` from an up-to-date `main`, one commit per logical step. Before each commit run `npm test`, `npm run check`, `npm run build` and `npm run links`, and require each to exit 0.

## Done when
- [ ] With no stored choice, every page matches the reader's system setting in Chrome, Safari and Firefox, including with JS disabled, where the toggle doesn't appear. Verified with `colorScheme` emulation in all three engines, JS on and off, over every built page (computed `background-color` of `body` and `color-scheme`).
- [ ] The toggle switches the theme, exposes its state correctly (`aria-pressed`, visible label), is keyboard reachable in reading order with the `--pen` outline, and works with Enter and Space. Verified in the browser, with a focus screenshot in each theme. Ideally also a VoiceOver spot check; record it if done.
- [ ] A stored choice survives reload and navigation with no flash of the wrong theme, both when the stored theme differs from the system and when it matches. Verified by checking `data-theme` and `body`'s computed background at first paint (e.g. a paint-timing or early-screenshot check) in all three engines.
- [ ] With `localStorage` blocked (stubbed to throw), pages load without errors, follow the system, and the toggle still flips the current page. Verified in the browser with the console listener.
- [ ] Every text/background pair passes 4.5:1 in both themes, and no hard-coded color is left in `src/` outside the token blocks. Verified by `tests/contrast.test.ts` and the no-hex test, plus the design-rules pass in both themes.
- [ ] Code blocks (including highlighted lines), stamps, sidenotes, `<mark>`, the featured title, the masthead cells, the CURRENTLY bar, the share strip and both buttons follow §6 in both themes at 1280 and 360px. Verified by screenshots of home and № 002 (plus a page with code, a sidenote and a `<mark>`; a draft fixture not committed is fine) in both themes, and the design-rules pass.
- [ ] Print is light regardless of theme. Verified with print emulation in dark mode and a Letter PDF of № 002 matching M6's.
- [ ] Every page makes only same-origin requests on load in both themes, and the scripts are only the ones listed under Constraints. Verified by the updated page audit and the request listener.
- [ ] Lighthouse still scores 100 for accessibility and best practices and 95+ for performance (median of three) on home and № 002, mobile and desktop, in both themes, against `astro preview`. Record the numbers next to M6's.
- [ ] Tests pass for the theme-resolution logic, the script/function parity check, the matching token blocks, and the extended contrast test. CI is green on the PR.
- [ ] progress.md is complete and status is COMPLETE.

## Needs Tony
- **Already settled (plan §6):** the dark palette, system default with a manual override, one `localStorage` entry, OG cards and print stay light.
- **`<mark>` and the featured title in dark: answered (A).** Keep the band, with light text, so dark mode reads as light mode inverted. The agent mocks it on the real page and reports how it reads.
- **Toggle wording: answered, the default.** Visible label "Dark theme" with `aria-pressed`. Copy in `site.theme`.

## Suggested order of work
1. Create `feature/darkTheme` from `main`. Reset progress.md for M7 using this kickoff's Done-when list. (Tony answered the Needs Tony questions before the start.)
2. `src/lib/theme.ts` with tests (resolution, stored-value parsing, constants).
3. Dark tokens and `color-scheme` in `global.css` (media query + `data-theme`), print forced light, the extended contrast test and the no-hex test. Screenshots of every page in dark via emulation, JS off.
4. Highlighter surfaces: dark text on highlighted code lines, and the `<mark>` / featured-title band with light text (screenshot it for Tony).
5. The head script and `ThemeToggle.astro` with its script, in both headers, with the parity test and `site.theme` copy. Browser checks: toggle, persistence, no flash, blocked storage, keyboard, three engines.
6. Surface sweep in both themes (stamps, masthead, CURRENTLY, sidenotes, share strip, buttons, focus, favicon) and fixes.
7. Final verification: page audit, same-origin requests, design-rules pass in both themes, print, Lighthouse on home and № 002 in both themes, screenshots at 1280, 390 and 360.
8. Update the README, record how each Done-when item was verified in progress.md, and set status COMPLETE.
