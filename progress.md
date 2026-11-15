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

## Decisions
- **The 404 page has no canonical link.** It is `noindex`, and a canonical pointing at `/404/` (which doesn't exist) would be worse than none. Every other page has one.

## Deviations / deferred

## Known issues
- This machine's default shell Node is 22. The repo needs 26 (`.nvmrc`); run `nvm use` first.

## Plan changes to consider
- A display name with a comma ("AI, honestly") reads awkwardly in comma-separated tag lists ("4 MIN · AI, HONESTLY, PROCESS"). Either avoid commas in names or switch the list separator; left as is for now.
- Plan §3 lists `tags/[tag].astro`; the site uses `/tag/<slug>/` (singular), the path `tagHref` and every existing link already use.

## Notes for the next kickoff
