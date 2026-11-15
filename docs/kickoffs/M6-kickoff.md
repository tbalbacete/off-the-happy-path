# M6: Sharing - Kickoff

## Goal
Make posts easy to pass on. Every post page gets a SHARE box with its permalink, plain share links (Email, LinkedIn, Bluesky, X) and a COPY LINK button. The button is the site's first and only client JS, scoped to post pages, and the page works without it. Each post also gets its own Open Graph card, so a shared link previews with the post's title instead of the site-wide image.

## Starting point
M5 is complete and merged (PR #12), followed by the feed-warning cleanup (PR #14, `45e693f`). From progress.md:
- Astro 7 on Node 26, TypeScript strict, static output, zero client JS. Live at `https://off-the-happy-path.vercel.app`; every push to `main` deploys. PR previews sit behind Vercel login, so an agent can't curl them.
- CI runs `check`, `test`, `build` and `links` on every PR and push to `main`. 225 Vitest tests.
- Published posts: № 002 "The time we didn't save" (rant) and № 001 "Hello, log" (note).
- The post route `src/pages/log/[slug].astro` passes `ReplyBox` and `PrevNext` into `PostLayout`'s `after` slot, inside the `article`. `PostLayout` has an `@media print` block that hides the reply box and prev/next.
- `pageMeta` (`src/lib/meta.ts`) builds every page's title, description, canonical and Open Graph/Twitter tags. `og:image` is always `site.og.image` (`/og.png`), with `site.og.width`, `height` and `alt`.
- `public/og.png` is a headless-Chrome screenshot of `design/og.html` (1200×630, fonts loaded from `node_modules`). Nothing generates it automatically.
- The M5 checking scripts (page audit, keyboard pass, design-rules check, Lighthouse runner, print renderer) lived in the scratchpad and are gone. Their checks are written out in M5's progress.md and below.

## Design reference
No new artboards. Follow plan §6 and the existing post-page components.

**The SHARE box** sits after REPLY and before MORE ENTRIES, in the same family as `ReplyBox`: a 2px `--ink` box, 18px 20px padding, a mono SHARE label (sentence case in `site.ts`, capitals from CSS). Inside, top to bottom:
1. **Permalink row:** the post's full canonical URL (`https://off-the-happy-path.vercel.app/log/<slug>/`) in IBM Plex Mono, selectable, wrapping anywhere (`overflow-wrap: anywhere`) so it never pushes the page wider at 360px. To its right on wide screens (below it on phones), the COPY LINK button.
2. **Links row:** `Email · LinkedIn · Bluesky · X` as text links in `--pen`, separated by a middot in `--pencil`. Plain words: no logos, icons or brand colors.

**The COPY LINK button:** a real `<button type="button">`, mono uppercase label, 2px `--ink` border, `--paper` background, `--ink` text, no radius or shadow. Hover inverts it (ink background, paper text). Focus uses the global 2px `--pen` outline. After a copy, the label reads COPIED for about 2 seconds, then goes back. Its width must not jump when the label changes (fix a `min-width`, or size it to the longer label).

**The per-post OG card** (1200×630) follows the shared card in `design/og.html`: `--paper` background, 2px `--ink` frame lines, asymmetric and left-aligned. Top: a mono line with the site name, `№ 002`, the type stamp (RANT in `--pen`, rotated −2° as everywhere) and the filed date. Middle: the title in Archivo, condensed (`font-stretch: 85%`) and heavy, as large as fits. Below it: the dek in Source Serif 4 italic, `--pencil`, at most three lines. Bottom: the post's path in mono (`/log/<slug>/`). Five colors only; no highlighter on the card.

## In scope
- **Share link logic.** `shareLinks(url, title)` in `src/lib/share.ts` returns `{ id, label, href }[]` in the order Email, LinkedIn, Bluesky, X, taking labels and the network list from `site.post.share`:
  - Email: `mailto:?subject=<title>&body=<url>`
  - LinkedIn: `https://www.linkedin.com/sharing/share-offsite/?url=<url>`
  - Bluesky: `https://bsky.app/intent/compose?text=<title> <url>`
  - X: `https://x.com/intent/post?text=<title>&url=<url>`
  
  Encode every value with `encodeURIComponent` (spaces as `%20`, never `+`, which some mail clients show literally). Vitest tests for each network, with a title containing curly quotes, `&`, `?`, `#` and `№`, and checks that a URL never appears unencoded inside another URL's query.
- **`ShareBox.astro`**, with typed props (`url`, `title`) and no data fetching, added to the post route's `after` slot between `ReplyBox` and `PrevNext`. The canonical URL comes from the same source as `pageMeta`'s canonical (the configured `site` plus the post path), so the box, the copy button and `<link rel="canonical">` always agree. Factor out a shared helper rather than building the URL twice. Share links are ordinary `<a href>`s, same tab, no `target="_blank"`. All copy goes in `site.post.share`.
- **The copy button script**, written in the component's `<script>` so Astro bundles it only into pages that render `ShareBox`:
  - The button renders with the `hidden` attribute. The script removes it, so readers without JS never see a button that does nothing.
  - Click: `navigator.clipboard.writeText(url)` with the URL from a `data-` attribute. On success: the label becomes COPIED, and a visually hidden `role="status"` live region (also rendered by the component) says "Link copied". Both reset after about 2 seconds, and a second click restarts the timer.
  - If `navigator.clipboard` is missing or the promise rejects: select the permalink text (`Range` + `Selection`) and announce "Press Ctrl+C or Cmd+C to copy" in the live region instead. No `document.execCommand`.
  - No other behavior, no dependencies, no globals. Keep it small enough to read in one screen. Record in progress.md whether Astro emitted it as a same-origin `/_astro/*.js` file or inlined it, and its size.
- **Print.** Hide the share box in `PostLayout`'s print block, alongside the reply box.
- **Per-post OG cards**, generated with headless Chrome like `public/og.png`, then committed:
  - Satori and resvg were considered and rejected: neither renders Archivo's variable width axis, and the condensed headline is the card's identity. Chrome renders the real fonts exactly as the site does.
  - A pure `ogCardHtml(post)` in `scripts/lib/og-card.mjs` returns the card's full HTML (fonts by relative `node_modules` path, as in `design/og.html`). It escapes the title and dek. It picks the title size from the title's length in a few fixed steps (a small pure function), so long titles fit in at most three lines. Vitest tests cover escaping, the size steps and the stamp class per type.
  - `scripts/og-card.mjs`, exposed as `npm run og -- <slug-or-number>` (and `npm run og -- --all`): renders the HTML with `playwright-core` (a devDependency) driving the system Chrome at 1200×630, device scale factor 1, waits for `document.fonts.ready`, and writes `public/og/<slug>.png`. The Chrome path defaults to `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`, overridable with `CHROME_PATH`. If Chrome is missing, exit non-zero with a one-line message naming `CHROME_PATH`.
  - `npm run publish` generates the card after setting the date and before `check` and `build`. If card generation fails, publish fails before writing anything, so a post is never published without its card. Inject the card step into the workflow functions so the existing integration test can stub it and still runs without Chrome.
  - Generate and commit cards for № 001 and № 002.
  - `pageMeta` takes an optional `image: { path, alt }`. Posts pass `/og/<slug>.png` and the alt `№ 002: The time we didn't save`. Other pages keep `site.og`. Update `tests/meta.test.ts`.
  - **Build guard:** in production builds, the post route fails the build with a clear message if a published post has no `public/og/<slug>.png` (e.g. someone published by hand). In dev, drafts fall back to `/og.png`. Put the check's logic in a pure, tested function.
  - Changing a published post's title or dek means regenerating its card. Add one line to the README's day-to-day loop: `npm run og -- <n>`.
- **README:** the `og` script, the system-Chrome requirement for `publish`, and the share box.

## Out of scope (do not build)
- Hacker News, Mastodon, Reddit, Facebook or any other network. Mastodon has no single share URL.
- The Web Share API or any mobile share sheet. Tony asked for copy link only.
- Share counts, share tracking, or anything that phones a network before a click.
- Share links on list pages, the home page, the archive or tag pages.
- Any client JS beyond the copy button. Home, type, tag, archive, About and 404 stay at zero scripts.
- Search, comments, a newsletter, analytics, a custom domain, a JSON feed, pagination.
- Moving the old checking scripts into the repo (`npm run verify-site`). Recreate what this milestone needs in the scratchpad, and note it again under Plan changes to consider if it's still wanted.

## Carry-over from M5
- Run everything on Node 26 (`nvm use`); the default shell Node is 22. Check each pre-commit run by its exit code, never by piping into `grep`.
- Push with `gh` for that one command: `git -c credential.helper= -c 'credential.helper=!gh auth git-credential' push`. Don't change the git config.
- Browser checks: install `playwright-core` in the session scratchpad for checking scripts (the repo gets it as a devDependency for `npm run og`; don't add check scripts to the repo), drive the system Chrome against `astro preview`, take full-page screenshots, and check `scrollWidth == clientWidth`.
- The M4/M5 page audit must be recreated and run again, **with one change**: "no `<script>` and no `.js` in `dist`" becomes "post pages carry exactly the copy-button script, and every other page has no `<script>`". The rest is unchanged: one `header`, `main`, `footer` and `nav aria-label="Main"`; exactly one `aria-current="page"` in the nav; one `h1`, first, and no skipped heading levels; `lang="en"`; a unique `<title>`; a description; the canonical (absolute, trailing slash, equal to `og:url`; none on the 404, which has `robots noindex`); the Open Graph and Twitter tags. Add a check that `og:image` on each post is `/og/<slug>.png` and returns 200 from `astro preview`.
- SmartyPants only runs on post bodies. Titles and deks carry typed curly quotes, so the share links, card and alt text must keep them as typed.
- Keep the conventions: copy in `site.ts`, mono labels in sentence case with CSS capitals, logic in `src/lib` or `scripts/lib` with tests, components with typed props and no data fetching.
- Open from M4: a tag named like a page ("notes", "archive") would duplicate that page's `<title>`. Still not in scope.

## Constraints
- **Five colors only**, plus `--hairline`, on the page and on the cards.
- **No shadows, gradients or rounded corners.** Lines and boxes only, asymmetric, nothing centered but the container. No icons or logos for the networks.
- **Fonts from `@fontsource` only.** No remote font requests, analytics, cookies or third-party scripts. No request leaves the site until a reader clicks a share link.
- **Client JS:** only the copy-button script, only on post pages, same-origin, no dependencies. Plan §6 records this exception.
- **Responsive:** the post page reads well at 1280, 390 and 360px, with a side gutter of at least 16px and no horizontal page scroll, the permalink included.
- **Accessibility:** the share box is a `section` with an accessible name (as `ReplyBox` is); the button has a visible text label; the status message reaches screen readers; contrast at least 4.5:1 for every new pair, the inverted hover state included; the share links and button are in reading order with `--pen` focus.
- **Commits:** branch `feature/sharePosts` from an up-to-date `main`, one commit per logical step. Before each commit run `npm test`, `npm run check`, `npm run build` and `npm run links`, and require each to exit 0.

## Done when
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

## Needs Tony
- **Already settled:** the four networks (no Hacker News); a COPY LINK button despite the zero-JS default; no Web Share API.
- **Wording:** the labels (SHARE, COPY LINK, COPIED, the screen-reader messages). The agent's defaults stand if there's no answer.
- **The card:** look at the generated cards for № 001 and № 002 and approve them, or ask for changes, before they're committed.
- **After the merge:** ask for the production link-preview check of a post card.

## Suggested order of work
1. Create `feature/sharePosts` from `main`. Reset progress.md for M6 using this kickoff's Done-when list. Ask Tony to confirm the wording under Needs Tony.
2. `src/lib/share.ts` and the canonical-URL helper, with tests, and `site.post.share` copy.
3. `ShareBox.astro` without the script: layout, links, permalink, print rule. Screenshots at 1280, 390 and 360.
4. The copy-button script, with the hidden-until-JS behavior, the live region and the fallback. Browser checks in Chrome, Safari and Firefox, with JS off, and with the clipboard stubbed away.
5. `ogCardHtml` and the size steps with tests. `npm run og` with `playwright-core`. Generate the № 001 and № 002 cards and show them to Tony.
6. `pageMeta`'s image option, the post route passing each card, and the build guard, with tests. Commit the approved cards.
7. Wire the card step into `npm run publish`, update the integration test, and update the README.
8. Final verification: the updated page audit, same-origin requests, keyboard pass, print, Lighthouse on № 002, share links opened in the browser, screenshots at 1280, 390 and 360.
9. Record how each Done-when item was verified in progress.md and set status COMPLETE. The post-merge link-preview check is recorded when Tony asks for it.
