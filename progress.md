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
- `ShareBox.astro` (props `url`, `title`): a `section` named "Share", in the `after` slot between `ReplyBox` and `PrevNext`, with a 2px ink box and 18px 20px padding like the reply box. The permalink is a mono 14px `p` with `overflow-wrap: anywhere`, and the links are a `ul` of `--pen` links with `--pencil` middots (`aria-hidden`). The post route builds the URL with `canonicalUrl(postHref(post.id), Astro.site)`. `PostLayout`'s print block hides `.share` with the reply box. Screenshots (playwright-core, system Chrome, `astro preview`) of № 002 and № 001 at 1280, 390 and 360: the box sits between REPLY and MORE ENTRIES, `scrollWidth == clientWidth` at every width, 16px gutters on phones. At 360 the URL wraps onto three lines inside the box. The first try put each middot before its link, so at 360 the X link wrapped with a dot at the start of its line. Each middot now follows its link instead.
- COPY LINK button and script in `ShareBox.astro`. The button is `type="button"`, rendered `hidden`, and carries the URL and messages in `data-` attributes; the script un-hides it. A click calls `navigator.clipboard.writeText`. On success the label reads COPIED and an `sr-only` `role="status"` paragraph says "Link copied", and both reset after 2 s (a second click restarts the timer). With no clipboard API, or a rejected promise, the script selects the permalink (`Range` + `Selection`) and announces "Press Ctrl+C or Cmd+C to copy". The button is mono 13px uppercase with a 2px ink border on paper, inverts on hover, and has `min-width` set for the longer label. **Astro inlined the script** as a `<script type="module">` in each post page (no `/_astro/*.js` file): 673 bytes, 392 gzipped. Only the two post pages have a `<script>`.
- Browser checks (playwright-core against `astro preview`; system Chrome, plus Playwright's Firefox and WebKit builds downloaded to the scratchpad, see Deviations):
  - Copy: Chrome (clipboard permissions, `readText`), Firefox and WebKit (Cmd+V into a scratch textarea) each got exactly `https://off-the-happy-path.vercel.app/log/the-time-we-didnt-save/`. Label COPY LINK → COPIED → COPY LINK after about 2.2 s, status "Link copied" → empty, button width the same before and after (117.9px). Enter and Space both copy. A second click 1.5 s after the first still showed COPIED 1 s later, so the timer restarted.
  - Fallback: with `navigator.clipboard` removed, and with a `writeText` that rejects, a click in each engine selected exactly the URL and the status read "Press Ctrl+C or Cmd+C to copy".
  - JS off: the button isn't visible in any engine. One click on the permalink selects the whole URL and Cmd+C copies it in all three. WebKit needed `-webkit-user-select: all` alongside `user-select`; without it a single click selected nothing there.
  - Keyboard (Chrome at 1280, 390 and 360): from the reply link, Tab goes COPY LINK → Email → LinkedIn → Bluesky → X → previous entry → footer. Each stop has a `solid 2px rgb(179, 25, 15)` outline. Focus screenshot of the button at 1280. Hover is paper `#f2f2ee` on ink `#111`, the same pair as body text reversed (well over 4.5:1), with no radius or shadow. At 1280 the button sits right of the URL. At 390 and 360 it drops below, and there's no horizontal scroll.

## Decisions
- **The permalink has `user-select: all`.** One click or tap selects the whole URL, which helps readers without JS (the button is hidden for them) and matches what the fallback does.

## Deviations / deferred
- **Firefox and Safari were checked with Playwright's Firefox and WebKit builds**, not installed Firefox and Safari. Firefox isn't installed on this machine, and driving real Safari needs `safaridriver --enable` (sudo) plus Safari's remote-automation setting. WebKit is Safari's engine. A manual click in Safari is still worth a minute if Tony wants it.

## Known issues
- This machine's default shell Node is 22. The repo needs 26 (`.nvmrc`); run `nvm use` first.

## Plan changes to consider
- Carried from M5: the checking scripts (page audit, keyboard pass, design-rules check, Lighthouse runner, print renderer) live in the session scratchpad. If they're wanted again, they're worth moving into `scripts/` as a single `npm run verify-site`.
- Open from M4: a tag named like a page ("notes", "archive") would duplicate that page's `<title>`.

## Notes for the next kickoff
