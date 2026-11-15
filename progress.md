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

## Decisions

## Deviations / deferred

## Known issues
- This machine's default shell Node is 22. The repo needs 26 (`.nvmrc`); run `nvm use` first.

## Plan changes to consider
- Plan §3 lists `tags/[tag].astro`; the site uses `/tag/<slug>/` (singular), the path `tagHref` and every existing link already use.

## Notes for the next kickoff
