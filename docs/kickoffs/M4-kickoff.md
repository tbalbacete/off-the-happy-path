# M4: Navigation, feeds, and the rest of the pages - Kickoff

## Goal
Finish the site's surface: tag pages, the archive, an About page, a styled 404, a full-content RSS feed, a sitemap, and correct `<title>`, description, canonical and Open Graph tags on every page, with one static OG image. Add tag display names. Every link the site already shows (RSS, tags, ABOUT, OLDER ENTRIES) must resolve. Still zero client JS.

## Starting point
M3 is complete and merged (PR #8, `bff06bc`). From progress.md:
- Astro 7 on Node 26, TypeScript strict, static output, zero client JS. Live at `https://off-the-happy-path.vercel.app`; every push to `main` deploys. PR previews sit behind Vercel login, so an agent can't curl them.
- CI runs `check`, `test` and `build` on every PR and push to `main`. 179 Vitest tests.
- **Markdown runs through `unified()` from `@astrojs/markdown-remark`**, not Astro 7's default Sätteri processor, with `rehypeSidenotes` and the Shiki code transformers (`src/lib/code.ts`) registered in `astro.config.mjs`.
- `src/lib`: `posts.ts` (`getPosts`, the only draft rule), `entries.ts` (`slugFromId`, `postHref`, `padEntryNo`, `formatEntryNo`), `home.ts` (`POST_TYPES`, `homeEntries`, `postsOfType`, `entryMeta`, `entrySummary`, `navItemForType`), `tags.ts` (`tagLabel`, `tagCounts`, `tagHref`), `post.ts` (`prevNext`, `neighbourLink`, `replyHref`, `postMeta`), `code.ts`, `rehype-sidenotes.ts`, `contrast.ts`, `dates.ts`, `reading-time.ts`.
- `src/components`: `Masthead`, `SiteNav` (tagline row + `MainNav`), `MainNav` (`nav aria-label="Main"`, `active` prop), `SiteHeader` (compact header used on posts), `LogHeader`, `FeaturedEntry`, `EntryRow` (`level` prop), `EntryMetaColumn`, `Stamp` (`large` prop), `CurrentlyBox`, `HomeAside`, `PostMeta`, `ReplyBox`, `PrevNext`, `Footer`. Layouts: `BaseLayout` (`title`, `description`), `PostLayout`.
- `global.css`: tokens (plus `--code-*` mapped to them), `.container`, `.label`, `.columns` / `.log`, `.highlight` / `mark` band, `.sr-only`, `.prose`, code box, sidenotes and end notes.
- All copy is in `src/data/site.ts`; mono labels are stored in sentence case and capitalised with CSS.
- Posts on production: № 004 "Nobody reads the ticket" (essay, the M3 sample, tags `process`, `requirements`), № 003 "Deploy check" (note), № 001 "Hello, log" (note, tag `meta`). № 002 is a draft. M5 removes № 003 and № 004.
- **Links that 404 today:** `/rss.xml` (nav, aside), `/tag/<slug>/` (aside FILED UNDER, post FILED UNDER), `/archive/` (home OLDER ENTRIES, only shown past seven posts). ABOUT in the nav points at `#about`, the aside section on the home page.
- `tagLabel('ai')` gives "Ai"; there is no display-name map yet.
- There is no `public/` folder yet.

## Design reference
There are no artboards for these pages. Build them from the pieces the Home and Post artboards already define, on the canvas at https://claude.ai/artifact/GK34FStGk8f8USEThnYXLq (`Main.dc.html`, `Post.dc.html`, `Style.dc.html`):

- **Secondary pages** (tag, archive, About, 404) use the post page's frame: the compact `SiteHeader`, then a title block like the post's (mono kicker, Archivo 900 `h1` at `font-stretch: 76%`, an italic serif dek), then the content, then the `Footer`. Same container and padding as posts. No masthead: that stays on the home and type pages.
- **Tag pages** `/tag/<slug>/`: kicker `FILED UNDER`, `h1` the tag's display name, a dek like "3 entries, newest first." Then the entries as `EntryRow`s at `h2` (the same rows as the type pages) under a 2px ink rule. No featured entry, no aside.
- **Archive** `/archive/`: kicker `ARCHIVE`, `h1` "Every entry", a dek with the count. Entries grouped by year, newest first: each year is an `h2` in mono (like the aside headings: 12px, pencil, over a 2px ink rule), and each entry is one compact line in a hairline-separated list: `№ 004` (mono 13px, 600), the date (mono, pencil), the stamp, and the title as a link (Archivo 750, `font-stretch: 85%`, about 20px). On phones the number, date and stamp sit on one line above the title.
- **About** `/about/`: kicker `ABOUT`, `h1` "About this log", then `.prose` paragraphs at article width (max 660px). Start from the copy already in `site.aside.about`, plus the reply-by-email line with a `--pen` `mailto:` link. Leave room for a short meta column like the post's (`AUTHOR`, `COVERAGE`, `STATUS` from the masthead cells) if it fits; it's optional. M5 writes the real copy.
- **404**: kicker `№ 404 · NOT FOUND`, `h1` short and plain (e.g. "Nothing filed here"), a one-line dek, then two or three mono links: the log (`/`), the archive, and RSS. Copy in `site.ts`.
- **OG image** (`public/og.png`, 1200×630): paper background, a 2px ink frame, the OTHP mark from the Style sheet (the 3px-bordered square with "OT / HP." and the pen-red period), the name in Archivo 900 condensed uppercase, and the tagline in italic serif. Only the five colors; no gradients or photos. Make it by rendering a small local HTML file with the self-hosted fonts in headless Chrome and screenshotting it. Commit the PNG and keep the source HTML next to it (e.g. `design/og.html`) so it can be regenerated.

## In scope
- **Tag display names:** `site.tagNames` maps slugs to display names (start with `ai: 'AI, honestly'`). `tagLabel(slug)` checks the map first and falls back to today's sentence case. Every place that shows a tag (home aside, entry meta lines, post FILED UNDER, tag pages) uses it. Tests for both paths.
- **Tag pages** `src/pages/tag/[tag].astro`, one per tag that appears on a visible post (`getStaticPaths` from `tagCounts(getPosts())`), at the `/tag/<slug>/` URLs `tagHref` already builds. Helper: `postsWithTag(posts, tag)`, tested.
- **Archive** `src/pages/archive.astro`. Helper: `archiveByYear(posts)` returning `[{ year, posts }]`, newest year first, posts newest first within a year, years read from the `YYYY-MM-DD` string (never through `Date`). Tested, including an empty list and a year boundary.
- **About** `src/pages/about.astro`, and `site.nav`'s ABOUT now points to `/about/`. The home aside keeps its ABOUT THIS LOG section.
- **404** `src/pages/404.astro` (Vercel serves `404.html` for static sites). It gets `<meta name="robots" content="noindex">`.
- **RSS** `src/pages/rss.xml.ts` with `@astrojs/rss`: channel title, description (the tagline), link, `language` `en`; one item per published post, newest first, with title, link, `pubDate` from `date`, the dek as `description`, and the full post HTML as `content`. Drafts never appear (it uses `getPosts`, and production builds exclude drafts).
  - Full content: prefer the entry's rendered HTML (`post.rendered?.html` from the glob loader). If that isn't populated with the `unified()` processor, use Astro's container API. Record what you chose.
  - Feed readers ignore our CSS, so the feed HTML must not repeat each note. A pure helper `feedHtml(html, siteUrl)` removes the `span.sidenote` copies (keeping the end notes) and turns root-relative `href` and `src` values into absolute URLs. Do it on a parsed tree (`rehype-parse` / `rehype-stringify` on top of the `unified` already installed), not with regex. Tests: a post with notes, with a code box, with relative and absolute links, and with no notes (unchanged apart from serialisation).
  - Add `<link rel="alternate" type="application/rss+xml">` to `BaseLayout`.
- **Sitemap** with `@astrojs/sitemap`, which reads `site` from the config. It lists every public page and leaves out the 404. Drafts aren't built, so they can't appear.
- **Meta tags in `BaseLayout`:** a `<title>` and description for every page (the post's title and dek, the tag's name, "Archive", "About", the home tagline), `<link rel="canonical">` built from `site` and the page path with a trailing slash, and Open Graph tags (`og:title`, `og:description`, `og:url`, `og:type` `article` on posts and `website` elsewhere, `og:site_name`, `og:image` as an absolute URL to `/og.png` with its width, height and alt). Add `twitter:card` `summary_large_image`. A small pure helper builds the tag list from page props (`pageMeta({ title, description, path, type })`), tested; `BaseLayout` only renders it.
- **Link check:** a small script, `npm run links`, that reads every `.html` file in `dist`, collects internal `href`s (skipping `mailto:`, external URLs and in-page `#` anchors), and fails listing any that don't resolve to a built file. Keep the logic in `scripts/lib/links.mjs` with tests on fixture HTML. Run it in CI after the build.
- **Copy in `site.ts`:** the kickers, page titles and deks, the archive and tag deks (with the count), the 404 lines, and the tag names.

## Out of scope (do not build)
- Favicon, Lighthouse pass, print styles, removing sample posts, real About and Currently copy (M5).
- Pagination on tag or archive pages.
- Search, a JSON feed, or per-post OG images.
- Any client JS.
- Redesigning the home, type or post pages beyond the nav change and the shared meta tags.

## Carry-over from M3
- Run everything on Node 26 (`nvm use`); the default shell Node is 22. Check each pre-commit run by its exit code, never by piping into `grep`.
- Push with `gh` for that one command: `git -c credential.helper= -c 'credential.helper=!gh auth git-credential' push`. Don't change the git config.
- Screenshots: install `playwright-core` in the session scratchpad (not the repo), drive the system Chrome (`/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`) against `astro preview`, take full-page shots, and check `scrollWidth == clientWidth`.
- When writing quotes that SmartyPants might curl the wrong way (such as `"//`), type the curly quotes yourself.
- Keep the M2/M3 conventions: copy in `site.ts`, mono labels in sentence case with CSS capitals, logic in `src/lib` or `scripts/lib` with tests, components with typed props and no data fetching.

## Constraints
- **Five colors only**, plus `--hairline`, including in the OG image.
- **No shadows, gradients or rounded corners.** Lines and boxes only, asymmetric, nothing centered but the container.
- **Fonts from `@fontsource` only**, also when rendering the OG image (load the font files from `node_modules`, not Google Fonts).
- **URLs:** tag pages stay at `/tag/<slug>/` (singular), the path `tagHref` and every existing link use. Plan §3 lists `tags/[tag].astro`; note the difference under Plan changes to consider rather than renaming.
- **Responsive:** every new page reads well at 1280, 390 and 360px, with a side gutter of at least 16px and no horizontal page scroll.
- **Accessibility:** each page has exactly one `header`, `main` and `footer`, and `nav aria-label="Main"` with the right active item (WRITING on tag, archive and 404 pages; ABOUT on About). Headings start at `h1` with no skipped levels. Contrast at least 4.5:1 for any new text and background pair. `lang="en"` everywhere.
- **Zero client JS:** no `<script>` in built pages and no `.js` in `dist`.
- **Commits:** branch `feature/navigationAndFeeds` from an up-to-date `main`, one commit per logical step. Before each commit run `npm test`, `npm run check` and `npm run build` (and `npm run links` once it exists), and require each to exit 0.

## Done when
- [ ] Every tag, type, archive, About and RSS link on every built page resolves: `npm run links` passes on the production build and runs in CI.
- [ ] Tag pages exist for every tag on a visible post, list only that tag's posts newest first, and show display names from `site.tagNames` (checked with a temporary `ai`-tagged post that is never committed). Verified in the built HTML.
- [ ] The archive lists every published entry grouped by year, newest first, and the home page's OLDER ENTRIES link lands on it.
- [ ] `/about/` and the 404 page are styled like the post page's frame and read well at 1280, 390 and 360px with no horizontal scroll. Verify with headless-browser screenshots and record them.
- [ ] The RSS feed validates and excludes drafts: it parses as XML, has one item per published post with full content and absolute links, contains no `class="sidenote"`, and passes the W3C Feed Validator on the production URL after the merge (or a local check against the same rules before it; record which).
- [ ] `sitemap-index.xml` and its sitemap list every public page (home, the three type pages, every post, every tag page, archive, About) and not the 404.
- [ ] Every built page has a unique `<title>`, a description, a canonical URL with the production origin and a trailing slash, and the Open Graph and Twitter tags listed in scope; `og:image` is absolute and `public/og.png` is 1200×630 and uses only token colors.
- [ ] No client JS, and the landmark, active-nav and heading checks pass on every built page.
- [ ] Tests pass for the new behavior: `tagLabel` with the map, `postsWithTag`, `archiveByYear`, `feedHtml`, `pageMeta`, and the link checker. CI is green on the PR.
- [ ] progress.md is complete and status is COMPLETE.

## Needs Tony
- **Tag names:** only `ai` → "AI, honestly" is known. Any other tag shows in sentence case unless Tony adds a name.
- **404 and About wording:** the agent writes placeholder copy in `site.ts`; Tony edits it any time. Real About copy is M5's.
- **OG image:** Tony approves the look via the PR (it is committed as a PNG, so the diff shows it).
- **Feed validation after merge:** the W3C validator can only fetch the production URL once this is merged and deployed. Tony can ask for that check after the merge.

## Suggested order of work
1. Create `feature/navigationAndFeeds` from `main`. Reset progress.md for M4 using this kickoff's Done-when list.
2. Tag display names in `site.ts` and `tagLabel`, with tests.
3. `pageMeta` and the canonical, Open Graph and RSS `<link>` tags in `BaseLayout`, with tests. Titles and descriptions on the existing pages.
4. The OG image: source HTML, render, commit `public/og.png`.
5. `postsWithTag` and the tag pages; the secondary-page frame shared with tag, archive, About and 404 (pull the post title block into a component if it helps).
6. `archiveByYear` and the archive page.
7. About and 404, and ABOUT in the nav pointing to `/about/`.
8. `feedHtml` and `/rss.xml`, with tests.
9. The sitemap.
10. `scripts/lib/links.mjs`, `npm run links`, and the CI step.
11. Responsive pass at 390px and 360px on every new page.
12. Verify: link check, feed checks, sitemap contents, meta tags on every page, screenshots, no-JS and landmark checks.
13. Record how each Done-when item was verified in progress.md and set status COMPLETE.
