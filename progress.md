# Progress

**Current milestone:** M4 - Navigation, feeds, and the rest of the pages
**Status:** IN PROGRESS   <!-- IN PROGRESS | BLOCKED | COMPLETE -->
**Kickoff:** docs/kickoffs/M4-kickoff.md
**Branch:** `feature/navigationAndFeeds`

M0's to M3's records are in git history (`progress.md` as of commits 084f458, 9406219, ef48ec2 and b8c049f).

## Done-when checklist
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

## Completed
- Branch `feature/navigationAndFeeds` created from `main` at d4f27fc.
- Tag display names: `site.tagNames` (`ai: 'AI, honestly'`) and `tagLabel(slug, names = site.tagNames)`, which checks the map (own keys only) and falls back to sentence case. The home aside, entry meta lines and post FILED UNDER all go through it. Fixed `postMeta` calling `tags.map(tagLabel)`, which would have passed the index as the map. Tests in `tags.test.ts`, `home.test.ts` and `post.test.ts`.
- `src/lib/meta.ts`: `pageMeta({ title, description, path, type, origin, noindex })` returns the full title, description, canonical URL (absolute, trailing slash) and the meta tags (description, robots on noindex pages, `og:site_name/type/title/description/url/image` with image width, height and alt, `twitter:card`). `BaseLayout` renders it from `Astro.url.pathname` and `Astro.site`, plus the RSS `<link rel="alternate">`. Posts pass `type="article"`; type pages get their own descriptions (`site.log.descriptions`). OG image details in `site.og`. Tests in `tests/meta.test.ts`.
- OG image: `design/og.html` (paper, 2px ink frame inset 32px, the OTHP mark at 132px with the pen-red period, the name in Archivo 900 at 72% stretch, the tagline in italic serif, a mono footer line under a 2px rule), rendered with the `@fontsource` files from `node_modules` in headless Chrome at 1200×630, scale 1, to `public/og.png`. All three fonts reported `loaded`. Color check (pngjs, in the scratchpad): every pixel lies within 0.78 RGB units of a token color or a blend of two token colors (anti-aliasing); 91% paper, 6.6% ink, the rest pencil, pen and edge blends.
- Secondary-page frame: the post's title block is now `TitleBlock` (kicker slot, h1, optional dek), shared by `PostLayout` and a new `PageLayout` (compact `SiteHeader`, title block, content, footer 64px below; same container and padding as posts).
- Tag pages `src/pages/tag/[tag].astro`: one per tag in `tagCounts(getPosts())`, kicker FILED UNDER, `h1` the display name, dek `N entries, newest first.`, the entries as `h2` `EntryRow`s under a 2px ink rule (max 900px). `postsWithTag` in `tags.ts`, `entryCount` in `src/lib/pages.ts`, copy in `site.tag` and `site.entryCount`. Tests in `tags.test.ts` and `pages.test.ts`.
- Checked with a temporary post № 005 (tags `ai`, `process`; deleted, never committed): the build made `/tag/ai/` with `<title>AI, honestly - Off the Happy Path</title>`, `h1` "AI, honestly", dek "1 entry, newest first." and only № 005; `/tag/process/` listed № 005 then № 004; the home aside and the post's FILED UNDER linked `/tag/ai/` as "AI, honestly".
- Archive `src/pages/archive.astro`: kicker ARCHIVE, `h1` "Every entry", dek `N entries, grouped by year, newest first.`, then a section per year (mono `h2` over a 2px ink rule) with an `ol` of hairline-separated rows: number, date, stamp, title link. On phones (≤600px) the title drops under the other three. `archiveByYear` in `src/lib/archive.ts` reads the year from the date string and sorts years and entries newest first. Copy in `site.archive`. Tests in `tests/archive.test.ts` (empty list, one year, a 2026/2027 boundary, unsorted input, no mutation).
- About `src/pages/about.astro`: kicker ABOUT, `h1` "About this log", a meta column (AUTHOR, COVERAGE, STATUS from the masthead cells, via `PostMeta` with a new `label` prop so the aside is named "About the log") beside `.prose` paragraphs at 660px: the home aside's intro and the reply line with a `--pen` `mailto:` link. ABOUT in `site.nav` now points to `/about/`; the home aside keeps its ABOUT THIS LOG section.
- 404 `src/pages/404.astro` (built as `dist/404.html`): kicker `№ 404 · Not found`, `h1` "Nothing filed here", a one-line dek, and three mono links (the log, the archive, RSS). `noindex`, no canonical, WRITING active. Placeholder copy in `site.about` and `site.notFound`.
- RSS `src/pages/rss.xml.ts` with `@astrojs/rss`: channel title, tagline as description, link, `<language>en</language>`; one item per `getPosts()` post with title, absolute link, `pubDate`, the dek as `description`, and the full post HTML as `content:encoded`. `feedHtml` (`src/lib/feed.ts`) parses with `rehype-parse`, drops every `span.sidenote` (end notes stay) and makes root-relative `href`/`src` absolute, then serialises with `rehype-stringify`. Tests in `tests/feed.test.ts`: notes, two sidenotes, a code box, relative and absolute links, mailto/in-page/protocol-relative links untouched, a URL object as the site, and a no-notes post unchanged. Added `@astrojs/rss`, `rehype-parse`, `rehype-stringify`; moved `unified` to `dependencies` since the build now uses it.
- Sitemap: `@astrojs/sitemap` in `astro.config.mjs`, with a filter that leaves out `/404`. The build writes `sitemap-index.xml` and `sitemap-0.xml`.
- Link check: `scripts/lib/links.mjs` (`extractHrefs` on a parsed tree, `isInternal`, `pagePath`, `candidateFiles`, `findBrokenLinks`) and the `scripts/check-links.mjs` CLI behind `npm run links`. It reads every `.html` in `dist`, resolves each internal `href` (on any element, so `<link>` too) against its page, and fails listing page and link for any that has no built file. CI runs it after the build. Tests in `tests/scripts-links.test.ts`. Checked by hand that removing `dist/archive` and `dist/rss.xml` makes it list every affected link and exit 1.

## Decisions
- **The 404 page has no canonical link.** It is `noindex`, and a canonical pointing at `/404/` (which doesn't exist) would be worse than none. Every other page has one.

- **The feed's full content comes from `post.rendered.html`.** The glob loader fills it with the `unified()` processor's output (sidenotes, code boxes and end notes included), so the container API wasn't needed. The feed throws if a post has no rendered HTML rather than shipping an empty item.
- **`pubDate` is noon UTC on the post's date**, so readers between UTC−12 and UTC+11 show the same calendar date the site does.

## Deviations / deferred

## Known issues
- This machine's default shell Node is 22. The repo needs 26 (`.nvmrc`); run `nvm use` first.

## Plan changes to consider
- A display name with a comma ("AI, honestly") reads awkwardly in comma-separated tag lists ("4 MIN · AI, HONESTLY, PROCESS"). Either avoid commas in names or switch the list separator; left as is for now.
- Plan §3 lists `tags/[tag].astro`; the site uses `/tag/<slug>/` (singular), the path `tagHref` and every existing link already use.

## Notes for the next kickoff
