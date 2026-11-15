# Progress

**Current milestone:** M2 - Home page to design
**Status:** COMPLETE   <!-- IN PROGRESS | BLOCKED | COMPLETE -->
**Kickoff:** docs/kickoffs/M2-kickoff.md
**Branch:** `feature/homePageDesign` (PR #6, open)

M0's and M1's records are in git history (`progress.md` as of commits 084f458 and 9406219).

## Done-when checklist
- [x] The home page matches the Home artboard at 1280px and reflows cleanly at 390px and 360px with no horizontal scroll - verified by: headless Chrome (playwright-core, outside the repo) full-page screenshots of `npm run build` + `astro preview` at 1280, 390 and 360 for `/` and all three type pages; `scrollWidth == clientWidth` on every one. The artboard source (`Main.dc.html`) was rendered statically at 1280 and compared with a build that temporarily had the artboard's twelve sample entries (№ 004–015, removed again, never committed): masthead cells, tagline and nav, log header and filters, featured entry with highlighter and LATEST, six rows with number, date and stamp (RANT in pen), `OLDER ENTRIES (008–001) →`, Currently box, FILED UNDER, About, links and footer all line up. Page heights 1830px (build) vs 1798px (artboard render). Remaining differences: tag labels read "Ai" not "AI, honestly" (display-name map is M4), the tagline wraps one word differently (self-hosted vs Google font metrics), and meta lines sit a few px lower. At 390/360 the masthead cells stack, the name scales down, the nav wraps under the tagline, each entry's meta becomes one line above it, and the aside drops below the log. Visual sign-off is Tony's.
- [x] `/type/essay/`, `/type/note/` and `/type/rant/` all build and list only posts of that type, with the right filter marked active. An empty type shows its empty line - verified by: built HTML and screenshots. `/type/note/` lists № 003 and № 001 with NOTES active in nav and filters; `/type/essay/` shows "No essays yet." (№ 002 is a draft) with WRITING and ESSAYS active; `/type/rant/` shows "No rants yet." with WRITING and RANTS active. In dev, `/type/essay/` lists № 002 with DRAFT.
- [x] The Currently box reads from `src/data/currently.ts`, and all other site text from `src/data/site.ts` - verified by: `HomeAside` imports `currently.ts` and passes it to `CurrentlyBox`; `grep` for literal text nodes in `src/components`, `src/pages` and `src/pages/type` found none (the post page in `log/` is M3's and untouched).
- [x] No client JS - verified by: 0 of the built HTML files contain `<script`, and `find dist -name '*.js'` finds 0 files.
- [x] Contrast and landmark checks pass - verified by: `tests/contrast.test.ts` reads the tokens from `global.css` and checks ink/paper 16.8, pencil/paper 6.9, pen/paper 6.1, paper/ink 16.8 and ink/highlighter 14.5 (all at least 4.5:1). Each of `index.html` and the three type pages has exactly 1 `<header`, 1 `<main`, 1 `<footer`, 1 `<nav aria-label="Main">` and 1 `<aside`; `lang="en"`; home heading order h1, h2 (featured), h3 rows, h2 aside sections; `aria-current="page"` on the active nav and filter links.
- [x] The design rules hold - verified by: `grep -rnoE '#[0-9a-fA-F]{3,8}' src` finds only the six declarations in `global.css` (five colors plus `--hairline`); no `rgb(`, `hsl(` or named colors; `grep -rnE 'box-shadow|border-radius|gradient' src` finds nothing.
- [x] Tests for the new behavior pass: unit tests for `homeEntries`, `postsOfType`, `tagLabel`, `tagCounts`, `entryMeta` and `contrastRatio`. CI is green on the PR - locally verified: `npm test` passes 13 files / 143 tests (new: `home.test.ts`, `tags.test.ts`, `contrast.test.ts`, plus `padEntryNo` in `entries.test.ts`); `npm run check` and `npm run build` exit 0 before every commit. CI `verify` passed on PR #6 (check, test, build), and the Vercel preview deployed.
- [x] progress.md is complete and status is COMPLETE - verified by: this file.

## Completed
- `src/lib/home.ts`: `POST_TYPES`, `homeEntries` (featured, next `count - 1` rows, and the `{ from, to }` entry-number range of the rest, or null), `postsOfType`, `entryMeta`. `src/lib/tags.ts`: `tagLabel`, `tagCounts` (most used, then alphabetical; a tag counts once per post). `padEntryNo` added to `entries.ts` for the older-entries range. Tests in `tests/home.test.ts`, `tests/tags.test.ts` and `tests/entries.test.ts`.
- `src/lib/contrast.ts`: `relativeLuminance` and `contrastRatio` (WCAG 2). `tests/contrast.test.ts` reads the tokens from `global.css` and checks every pair in use: ink, pencil and pen on paper, paper on ink (the CURRENTLY bar), and ink on highlighter (the featured title band).
- `src/data/site.ts` now holds all page copy: name lines, the long tagline, masthead cells, nav, log headings, filters, empty lines, aside copy, footer lines, and the real email (`tbalbacete@gmail.com`) and GitHub (`https://github.com/tbalbacete`). `src/data/currently.ts` holds `{ shipping, reading, annoyedBy }` with the artboard's placeholders. `BaseLayout` takes a `description` prop (defaults to the tagline) and renders `<meta name="description">`.
- `src/components/`: `Stamp` (RANT in `--pen`), `Masthead` (form cells, name in a `clamp()` size, cells as a `<dl>`), `SiteNav` (tagline row, `nav aria-label="Main"`, active item in `--pen` with a 2px underline and `aria-current="page"`), `Footer`. `global.css` gains `.container` (1180px, 40/32/56 padding; 20/16/40 under 480px), `.label` / `.label--small`, link underline offset and the `--pen` hover. The home page uses them around the old list.
- `LogHeader` (filters as a list labelled "Filter by type", active one ink, underlined, `aria-current="page"`), `FeaturedEntry` (h2, highlighter band, LATEST, `READ ENTRY →` in `--pen`), `EntryRow` (h3 by default, `level` prop for type pages), and a shared `EntryMetaColumn` (number, `<time>`, stamp, LATEST / DRAFT in `--pen`). `entrySummary` in `src/lib/home.ts` turns a post into their props (href, reading time, meta line), with tests. `index.astro` now shows the log: featured entry, up to six rows, and the older link when entries remain.
- `CurrentlyBox` (2px ink box, ink header bar with paper text, `<dl>` with hairlines; reads `currently.ts` through its prop) and `HomeAside` (Currently, FILED UNDER from `tagCounts`, ABOUT THIS LOG with `id="about"` and a `mailto:` "email me", and the RSS / GitHub / Email links). `tagHref` added to `tags.ts` with a test. The home page now has the aside.
- `src/pages/type/[type].astro`: `getStaticPaths` from `POST_TYPES`, so all three pages always build. Same masthead, nav, aside and footer; `LogHeader` with that filter active; every matching post as an `EntryRow` at h2 (no featured entry, no highlighter); the empty line from `site.log.empty` otherwise. `navItemForType` in `home.ts` (NOTES on the note page, WRITING on the others), with a test. Production build: `/type/note/` lists № 003 and № 001; `/type/essay/` shows "No essays yet." (the only essay, № 002, is a draft); `/type/rant/` shows "No rants yet."
- Responsive pass: checked at 1280, 390 and 360 with the live posts and with the artboard's twelve sample entries added temporarily (never committed). Fixed `READ ENTRY →` breaking before its arrow at 360 (`white-space: nowrap`) and tightened the meta column line-height to 1.3 to match the artboard's spacing. Dev shows the draft № 002 with DRAFT in `--pen` on `/type/essay/`; production leaves it out.

## Decisions
- **`homeEntries` reads the older range from entry numbers, not positions**, so gaps (a removed post) still give the right `(008–001)`-style label.
- **Mono labels are stored in sentence case and capitalised with CSS** (`text-transform: uppercase`), so screen readers read "Currently", not C-U-R-R-E-N-T-L-Y.
- **The artboard's RSS links (nav and aside) point to `/rss.xml` now**, so the page matches the design. They 404 until M4 builds the feed.
- **The highlighter is a thick underline** (`text-decoration-thickness: 0.32em`, `text-underline-offset: -0.24em`, `skip-ink: none`) on a span inside the featured title, because the artboard's `box-shadow: inset` breaks the no-shadow rule.
- **Deks use `--ink`**, not the artboard's `#2B2A27`, to stay at five colors.
- **The filter links are a `<ul aria-label="Filter by type">`, not a second `<nav>`**, so the page has exactly one labelled nav as the kickoff asks.
- **Under 600px the meta column becomes one line above the content** (number, date, stamp, LATEST) instead of a 150px column, to save vertical space on phones.
- **FILED UNDER links point to `/tag/<slug>/`** (via `tagHref`), the URLs M4's tag pages will use. Like RSS, they 404 until M4. The section is left out when no post has tags.
- **Entry titles on type pages are h2**, since there is no featured entry to sit under; the home page keeps h3 under the featured h2.

## Deviations / deferred
- The Currently box keeps the artboard's bracketed placeholders (Tony's choice). M5 fills `src/data/currently.ts`.

## Known issues
- This machine's default shell Node is 22.12. The repo needs 26 (`.nvmrc`); run `nvm use` first.

## Plan changes to consider
- Plan §6 lists a hairline tint as the one neutral; the artboard also uses `#2B2A27` for deks. M2 uses `--ink` for deks. If a softer dek is wanted later, it would be a seventh color and needs a plan change.

## Notes for the next kickoff
- RSS (`/rss.xml`) and tag links (`/tag/<slug>/`) are already linked from the nav and aside and 404 until M4 builds them. The older link goes to `/archive/` (M4) and only shows with more than seven posts.
- `tagLabel` gives "Ai" for `ai`; M4's display-name map should cover cases like "AI, honestly".
- `ABOUT` in the nav points at `#about` (the aside section); M4 repoints it to `/about/` in `site.ts`.
- Reusable pieces for M3/M4: `Masthead`, `SiteNav` (`active` prop), `Footer`, `Stamp`, `EntryRow` (`level` prop), `entrySummary`, `.container`, `.label`, `.columns` / `.log` in `global.css`.
- The screenshot rig lived in the session scratchpad (playwright-core driving the system Chrome). It isn't in the repo; reinstall it the same way if M3 needs screenshots.
