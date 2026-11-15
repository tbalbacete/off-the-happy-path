# Progress

**Current milestone:** M6 - Sharing
**Status:** IN PROGRESS   <!-- IN PROGRESS | BLOCKED | COMPLETE -->
**Kickoff:** docs/kickoffs/M6-kickoff.md
**Branch:** `feature/sharePosts`

M0's to M5's records are in git history (`progress.md` as of commits 084f458, 9406219, ef48ec2, b8c049f, fe98946 and ffa3d0d).

## Done-when checklist
- [ ] Every published post has a SHARE box between REPLY and MORE ENTRIES, matching the design reference, with the canonical URL as selectable text and Email, LinkedIn, Bluesky and X links whose hrefs are built by `shareLinks` and covered by tests. Verified by tests, the page audit, and screenshots at 1280, 390 and 360 (no horizontal scroll).
- [ ] Each share link opens that network's compose or share screen with the post's title and URL filled in. Verified by opening each one from № 002 in the browser (signed out is fine; record what each screen showed) and the `mailto:` in the default mail client.
- [ ] The COPY LINK button copies exactly the canonical URL in Chrome, Safari and Firefox, shows COPIED and resets, and its status is announced. Verified by reading the clipboard after a click in each browser (or with Playwright's clipboard permissions in Chrome), plus a check of the live region's text. Record the result for each browser.
- [ ] With JS disabled, the button is absent and the permalink can still be selected and copied. With the clipboard API removed (stubbed in the browser), a click selects the permalink and announces the fallback. Verified in the browser.
- [ ] The button and links are reachable by keyboard in reading order with the visible `--pen` outline. The button works with Enter and Space. Verified by tabbing, with a focus screenshot.
- [ ] Post pages carry only the copy-button script. Every other page has no `<script>`. Every page makes only same-origin requests on load. Verified by the updated page audit over every built page and the request listener at 1280 and 390.
- [ ] Each published post has `public/og/<slug>.png` (1200×630, design rules met), its `og:image`, width, height and alt point at it, and a build without a published post's card fails. Verified by the audit, a pixel check against the token colors as in M5, a deliberate failed build with the card moved away, and (after the merge, when Tony asks) a link-preview check on production.
- [ ] `npm run publish` generates the card before building, and fails without changing anything if Chrome is missing. Verified by the integration test (with a stubbed card step) and one manual run with a bad `CHROME_PATH` on a throwaway draft that is never committed.
- [ ] The share box doesn't print. Verified with print emulation and a PDF of № 002.
- [ ] Lighthouse still scores 100 for accessibility and best practices and 95+ for performance (median of three) on № 002, mobile and desktop, against `astro preview`. Record the numbers next to M5's.
- [ ] Tests pass for all new logic (`share.ts`, the canonical-URL helper, `og-card.mjs`, the card-size steps, the build guard, `pageMeta`'s image option, the publish workflow). CI is green on the PR.
- [ ] progress.md is complete and status is COMPLETE.

## Completed
- Branch `feature/sharePosts` created from `main` at ffa3d0d.
- Wording (asked at the start): Tony kept the defaults. SHARE, COPY LINK → COPIED, screen-reader messages "Link copied" and "Press Ctrl+C or Cmd+C to copy", links Email · LinkedIn · Bluesky · X. All in `site.post.share`.
- `canonicalUrl(path, origin)` in `src/lib/meta.ts`: the origin plus the path with a trailing slash. `pageMeta` now uses it for the canonical and `og:url`, and the share box will use it for the permalink, so they can't disagree.
- `shareLinks(url, title)` in `src/lib/share.ts`: Email, LinkedIn, Bluesky, X in `site.post.share.networks` order, every value through `encodeURIComponent`. Tests (`tests/share.test.ts`, plus `canonicalUrl` in `tests/meta.test.ts`) use a title with curly quotes, `&`, `?`, `#` and `№`: exact hrefs per network, no `+` or raw spaces, no raw `?#“”’№` in any query, round-trip through `URLSearchParams`, and the post URL never appears unencoded. 236 tests.

## Decisions

## Deviations / deferred

## Known issues
- This machine's default shell Node is 22. The repo needs 26 (`.nvmrc`); run `nvm use` first.

## Plan changes to consider
- Carried from M5: the checking scripts (page audit, keyboard pass, design-rules check, Lighthouse runner, print renderer) live in the session scratchpad. If they're wanted again, they're worth moving into `scripts/` as a single `npm run verify-site`.
- Open from M4: a tag named like a page ("notes", "archive") would duplicate that page's `<title>`.

## Notes for the next kickoff
