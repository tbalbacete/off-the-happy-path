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
- `src/data/site.ts` now holds all page copy: name lines, the long tagline, masthead cells, nav, log headings, filters, empty lines, aside copy, footer lines, and the real email (`tbalbacete@gmail.com`) and GitHub (`https://github.com/tbalbacete`). `src/data/currently.ts` holds `{ shipping, reading, annoyedBy }` with the artboard's placeholders. `BaseLayout` takes a `description` prop (defaults to the tagline) and renders `<meta name="description">`.
- `src/components/`: `Stamp` (RANT in `--pen`), `Masthead` (form cells, name in a `clamp()` size, cells as a `<dl>`), `SiteNav` (tagline row, `nav aria-label="Main"`, active item in `--pen` with a 2px underline and `aria-current="page"`), `Footer`. `global.css` gains `.container` (1180px, 40/32/56 padding; 20/16/40 under 480px), `.label` / `.label--small`, link underline offset and the `--pen` hover. The home page uses them around the old list.
- `LogHeader` (filters as a list labelled "Filter by type", active one ink, underlined, `aria-current="page"`), `FeaturedEntry` (h2, highlighter band, LATEST, `READ ENTRY →` in `--pen`), `EntryRow` (h3 by default, `level` prop for type pages), and a shared `EntryMetaColumn` (number, `<time>`, stamp, LATEST / DRAFT in `--pen`). `entrySummary` in `src/lib/home.ts` turns a post into their props (href, reading time, meta line), with tests. `index.astro` now shows the log: featured entry, up to six rows, and the older link when entries remain.
- `CurrentlyBox` (2px ink box, ink header bar with paper text, `<dl>` with hairlines; reads `currently.ts` through its prop) and `HomeAside` (Currently, FILED UNDER from `tagCounts`, ABOUT THIS LOG with `id="about"` and a `mailto:` "email me", and the RSS / GitHub / Email links). `tagHref` added to `tags.ts` with a test. The home page now has the aside.

## Decisions
- **`homeEntries` reads the older range from entry numbers, not positions**, so gaps (a removed post) still give the right `(008–001)`-style label.
- **Mono labels are stored in sentence case and capitalised with CSS** (`text-transform: uppercase`), so screen readers read "Currently", not C-U-R-R-E-N-T-L-Y.
- **The artboard's RSS links (nav and aside) point to `/rss.xml` now**, so the page matches the design. They 404 until M4 builds the feed.
- **The highlighter is a thick underline** (`text-decoration-thickness: 0.32em`, `text-underline-offset: -0.24em`, `skip-ink: none`) on a span inside the featured title, because the artboard's `box-shadow: inset` breaks the no-shadow rule.
- **Deks use `--ink`**, not the artboard's `#2B2A27`, to stay at five colors.
- **The filter links are a `<ul aria-label="Filter by type">`, not a second `<nav>`**, so the page has exactly one labelled nav as the kickoff asks.
- **Under 600px the meta column becomes one line above the content** (number, date, stamp, LATEST) instead of a 150px column, to save vertical space on phones.
- **FILED UNDER links point to `/tag/<slug>/`** (via `tagHref`), the URLs M4's tag pages will use. Like RSS, they 404 until M4. The section is left out when no post has tags.

## Deviations / deferred
- The Currently box keeps the artboard's bracketed placeholders (Tony's choice). M5 fills `src/data/currently.ts`.

## Known issues
- This machine's default shell Node is 22.12. The repo needs 26 (`.nvmrc`); run `nvm use` first.

## Plan changes to consider

## Notes for the next kickoff
