# M2: Home page to design - Kickoff

## Goal
Build the home page to match the Home artboard, plus working `/type/essay|note|rant/` filter pages, responsive down to 360px, with zero client JS.

## Starting point
M1 is complete and merged (PRs #3 and #4). From progress.md:
- Astro 7 on Node 26, TypeScript strict, static output, zero client JS. Live at `https://off-the-happy-path.vercel.app`, and `site` is set to it. Every push to `main` deploys. PRs get preview URLs, but those sit behind Vercel login, so an agent can't curl them.
- CI runs `check`, `test` and `build` on every PR and on every push to `main`. 105 Vitest tests.
- `src/lib`: `posts.ts` (`getPosts`, `filterDrafts`, `sortNewestFirst`), `entries.ts` (`slugFromId`, `formatEntryNo`), `dates.ts`, `reading-time.ts`.
- `src/data/site.ts`: name, author, tagline, and placeholder email and GitHub link (M2 sets the real ones; see Needs Tony).
- `src/styles/global.css`: the five color tokens, `--hairline`, font tokens, base body type, `:focus-visible` in `--pen`. Fonts are self-hosted with `@fontsource`.
- `index.astro` is a bare list. `log/[slug].astro` is a bare post page (M3 designs it). There is no `src/components/` yet.
- Posts: `001-hello-log.md` (published), `002-draft-example.md` (draft), and `003-deploy-check.md` (published, a throwaway that M5 removes). Production therefore lists № 003 and № 001.
- `npm run new` and `npm run publish` work and need Node 26 (`nvm use`).

## Design reference
The Home artboard (`Main.dc.html`) on the "Off the Happy Path — blog design" canvas: https://claude.ai/artifact/GK34FStGk8f8USEThnYXLq. The Style sheet artboard sits beside it. Read the artboard source for exact sizes. The structure, top to bottom, inside a container 1180px max wide with 40px / 32px / 56px padding:

1. **Masthead (form cells).** A 2px ink border around cells separated by 2px ink gaps (a `--ink` background with a 2px `gap`). The left cell has a mono 11px `TITLE OF DOCUMENT` label above the name: Archivo 900, `font-stretch: 72%`, 92px, line-height 0.88, uppercase, broken after "Off the". The right column has three stacked cells, each with a mono 10.5px label and a mono 14px value: `AUTHOR` "Tony Albacete, software engineer", `COVERAGE` "The job, not the hype", `STATUS` "Ongoing. Mostly."
2. **Tagline and nav row.** An italic Source Serif 21px tagline on the left, max 640px: "Notes on software engineering as it actually goes: vague tickets, legacy code, interviews, meetings, and the occasional thing that worked the first time." A mono 13px nav on the right. The active item is `--pen` with a 2px underline. A 1px ink rule closes the row.
3. **Log column** (`main`, left) and **aside** (right), in a flex-wrap row with a 40px / 56px gap.
   - **Log header:** mono 12px `--pencil` `LOG: ALL ENTRIES, NEWEST FIRST` on the left, and the filter links `ALL · ESSAYS · NOTES · RANTS` on the right. The active one is ink and underlined; the rest are pencil with no underline. A 2px ink rule sits below.
   - **Featured (latest) entry:** a 150px meta column holds `№ 015` (mono 13px, 600, ink), the date, the stamp, and `LATEST` in `--pen`, 600. The content column holds the title (Archivo 800, `font-stretch: 80%`, 48px, with the highlighter band on the lower third of the text), the dek (19px), and a mono 12px meta line `9 MIN · PROCESS, REQUIREMENTS · READ ENTRY →`, where `READ ENTRY →` is a `--pen` link. A 1px ink rule closes it.
   - **Entry rows:** the next six entries. Same meta column, minus `LATEST`. The title is Archivo 750, `font-stretch: 85%`, 27px. Then the dek (17px), then the meta line (`2 MIN · PROCESS`). 1px hairline rules sit between rows.
   - **Older link:** `OLDER ENTRIES (008–001) →`, shown only when entries remain beyond the seven on the page.
   - **Aside:** four sections.
     - The CURRENTLY box: 2px ink border, an ink header bar with paper text, and a `<dl>` with SHIPPING / READING / MILDLY ANNOYED BY, hairlines between items.
     - FILED UNDER: a mono 12px heading over a 2px ink rule, then tag links in serif 17px.
     - ABOUT THIS LOG: two short paragraphs, with "email me" as a `--pen` link.
     - A mono links list (RSS FEED, GITHUB, EMAIL).
4. **Footer:** a 2px ink top rule, then mono 12px pencil text: "© 2026 Tony Albacete · Opinions are mine, not my employer's." on the left and "Plain HTML. No tracking. No pop-ups. Hosted for $0." on the right.

**Stamps** (ESSAY / NOTE / RANT): mono 10.5px, 0.1em tracking, 1.5px border, 2px / 7px padding, rotated -2°. RANT uses `--pen` for both border and text; the others use ink.

## In scope
- **Pure helpers in `src/lib`, with Vitest tests:**
  - `homeEntries(posts, count = 7)`: returns `{ featured, rows, older }`. `featured` is the newest post. `rows` holds the next `count - 1`. `older` is `{ from, to }` (entry numbers) when more posts remain, else `null`.
  - `postsOfType(posts, type)`.
  - `tagLabel(slug)`: `legacy-code` becomes "Legacy code" (hyphens to spaces, sentence case). M4 adds the display-name map in front of it.
  - `tagCounts(posts)` for FILED UNDER, most used first, then alphabetical.
  - `entryMeta(minutes, tags)`: returns `"9 MIN · PROCESS, REQUIREMENTS"`.
  - Contrast: `contrastRatio(hexA, hexB)` (WCAG 2 relative luminance). Test that every text and background pair the page uses meets 4.5:1: ink, pencil and pen on paper, and paper on ink.
- **Components in `src/components/`** with typed props and no data fetching: `Masthead` (form cells), `SiteNav` (the tagline row; takes the active item), `LogHeader` (takes the active filter), `Stamp`, `FeaturedEntry`, `EntryRow`, `CurrentlyBox`, `HomeAside`, `Footer`.
- **Data:**
  - `src/data/site.ts` gains the masthead cells (author line, coverage, status), the long tagline, the About this log copy, the footer lines, and the nav items.
  - New `src/data/currently.ts` holds `{ shipping, reading, annoyedBy }`. Keep the artboard's bracketed placeholders (Tony's choice); M5 fills them.
- **`src/pages/index.astro`:** masthead, nav, log header with `ALL` active, featured entry, rows, older link, aside, footer.
- **`src/pages/type/[type].astro`:** `getStaticPaths` always generates all three types, even when a type has no posts. Same masthead, nav, aside and footer. The log header reads `LOG: ESSAYS, NEWEST FIRST` (etc.) with that filter active, and every matching post is listed as an `EntryRow`, with no featured entry and no highlighter. An empty type shows one plain line, e.g. "No rants yet."
- **Link targets in M2:**
  - Nav: `WRITING` goes to `/` (active on the home page and the essay and rant pages), `NOTES` to `/type/note/` (active there), and `ABOUT` to `#about` (the aside section; M4 repoints it to `/about/`).
  - Filters go to `/` and `/type/essay|note|rant/`.
  - Entry titles and `READ ENTRY →` go to `/log/<slug>/`.
  - The older link goes to `/archive/` (M4 builds that page). With three posts it doesn't render yet.
  - GITHUB and EMAIL come from `site.ts`.
- **In dev only, a draft row shows `DRAFT` in `--pen` in its meta column**, so drafts are obvious while writing. Production builds never include drafts.
- **`BaseLayout`:** add a `description` prop and a `<meta name="description">` (home uses the tagline). Full meta and OG tags are M4.
- **Responsive:** see Constraints.

## Out of scope (do not build)
- The post page design: compact header, kicker, meta column, sidenotes, code boxes, reply box, prev/next (M3). Leave `log/[slug].astro` as it is.
- Tag pages, archive, About page, 404, RSS, sitemap, OG tags, and the tag display-name map (M4).
- Real Currently and About copy, favicon, print styles, Lighthouse pass, removing sample posts (M5).
- Any client JS (no menu toggle; the nav wraps instead).

## Carry-over from M1
- Run everything on Node 26 (`nvm use`). This machine's default shell Node is 22.
- When checking a pre-commit run, use the command's exit code, not `grep` on its output. In M1 a piped `npm test | grep` hid a failure and a broken commit got pushed.
- The throwaway `003-deploy-check.md` will be the featured entry on the live home page until M5. That's expected.
- Plan changes flagged but not yet applied to `docs/plan.md` (from M0 and M1): the URL slug comes from the file name; impossible unquoted dates are caught by a raw-text check; CI exists; `npm run new` writes a placeholder dek that `publish` refuses; template reminders are frontmatter comments; Vercel previews sit behind login. Leave the plan alone unless Tony asks.

## Constraints
- **Five colors only** (plan §6): `--paper`, `--ink`, `--pencil`, `--pen`, `--highlighter`, plus `--hairline` for 1px dividers. Where the artboard uses `#2B2A27` for deks, use `--ink`. Don't add a sixth color. Record this under Decisions.
- **No shadows, gradients or rounded corners.** The artboard draws the featured-title highlighter with `box-shadow: inset`, which this rule forbids. Draw the band without a shadow or gradient instead. A thick `text-decoration` in `--highlighter` works (`text-decoration-thickness` about 0.32em, a negative `text-underline-offset`, `text-decoration-skip-ink: none`), or a `<mark>` styled to the lower third. Use the highlighter once per page at most.
- **Fonts come from `@fontsource` only.** Ignore the artboard's Google Fonts `<link>`. Headlines are Archivo with `font-stretch` 72–85% and weight 750–900. Body is Source Serif 4. Labels, stamps and meta are IBM Plex Mono, uppercase, with 0.04–0.12em tracking.
- **Layout:** lines and boxes only. Asymmetric: content left, aside right. Nothing centered except the page container itself. No cards, hero images, emoji or icon grids.
- **Responsive:**
  - At 1280px the page matches the artboard.
  - At 390px and down to 360px: the masthead cells wrap (the right column drops below the name), the masthead name scales down (e.g. `clamp()`), the nav wraps under the tagline, and the aside drops below the log.
  - Entry meta columns stack above their content when there's no room.
  - Side gutter of at least 16px, and no horizontal scroll.
- **Accessibility:**
  - Semantic landmarks: one `header` (the masthead), `nav aria-label="Main"`, one `main`, `aside`, `footer`.
  - Real links, a sensible heading order (`h1` site name, `h2` for the featured entry and the aside sections, `h3` for rows), and `lang="en"`.
  - Visible `:focus-visible` in `--pen`. Text contrast at least 4.5:1.
  - Mark the active nav and filter links with `aria-current="page"`.
- **Zero client JS:** no `<script>` in built pages and no `.js` files in `dist`.
- **No hard-coded copy:** all site text comes from `src/data/site.ts` and `src/data/currently.ts`.
- **Logic stays in `src/lib`:** pages call helpers and pass props. The draft rule stays only in `posts.ts`.
- **Commits:** branch `feature/homePageDesign` from an up-to-date `main`, one commit per logical step. Before each commit, run `npm test`, `npm run check` and `npm run build`, and require each to exit 0.

## Done when
- [ ] The home page matches the Home artboard at 1280px (masthead cells, tagline and nav, log header with filters, featured entry with highlighter, entry rows with number, date and stamp, aside, footer) and reflows cleanly at 390px and 360px with no horizontal scroll. Verify with headless-browser screenshots at 1280, 390 and 360, compare them against the artboard, and record the comparison.
- [ ] `/type/essay/`, `/type/note/` and `/type/rant/` all build and list only posts of that type, with the right filter marked active. An empty type shows its empty line.
- [ ] The Currently box reads from `src/data/currently.ts`, and all other site text from `src/data/site.ts`.
- [ ] No client JS: built pages contain no `<script>` and `dist` contains no `.js` files.
- [ ] Contrast and landmark checks pass: the contrast test covers every text and background pair in use, and the built HTML has exactly one each of `header`, `main`, `footer`, a labelled `nav` and an `aside`.
- [ ] The design rules hold: only the five colors plus the hairline appear in the CSS, and there are no `box-shadow`, `border-radius` or gradients. Verify with `grep` over `src/`.
- [ ] Tests for the new behavior pass: unit tests for `homeEntries`, `postsOfType`, `tagLabel`, `tagCounts`, `entryMeta` and `contrastRatio`. CI is green on the PR.
- [ ] progress.md is complete and status is COMPLETE.

## Needs Tony
- **Contact details (given by Tony):** set `email` in `site.ts` to `tbalbacete@gmail.com` and the GitHub link to `https://github.com/tbalbacete`. The EMAIL link and "email me" use `mailto:`.
- **Currently box:** Tony chose to keep the artboard's bracketed placeholders. List them under Deviations / deferred for M5. Use the artboard's About this log copy as written.
- **Visual sign-off:** the agent can compare screenshots against the artboard, but Tony gets the final say. Ask him to look at the PR preview (behind Vercel login) or at the production URL after the merge.

## Suggested order of work
1. Create `feature/homePageDesign` from `main`. Reset progress.md for M2 using this kickoff's Done-when list.
2. `homeEntries`, `postsOfType`, `tagLabel`, `tagCounts` and `entryMeta` in `src/lib`, test-first.
3. `contrastRatio` and its test over the token pairs.
4. Extend `site.ts`, add `currently.ts`, add the `description` prop to `BaseLayout`.
5. `Stamp`, `Masthead`, `SiteNav`, `Footer`, and any small global CSS additions (container, mono label style).
6. `LogHeader`, `FeaturedEntry`, `EntryRow`. Rebuild `index.astro` with them.
7. `CurrentlyBox` and `HomeAside`. Wire them into the home page.
8. `type/[type].astro`, with active filter and nav states and the empty-type line.
9. Responsive pass at 390px and 360px.
10. Verify: screenshots at 1280, 390 and 360 against the artboard, a `grep` audit of the design rules, a no-JS check of `dist`, and a landmark check of the built HTML.
11. Record how each Done-when item was verified in progress.md and set status COMPLETE.
