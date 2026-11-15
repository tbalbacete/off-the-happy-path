# M3: Post page to design - Kickoff

## Goal
Build the post page to match the Post artboard: compact header, kicker and title block, meta column, body typography, titled code boxes with line highlights, `<mark>`, sidenotes from footnotes (in the margin on wide screens, end notes on narrow ones), the reply box, and previous/next links. All with zero client JS.

## Starting point
M2 is complete and merged (PR #6). From progress.md:
- Astro 7 on Node 26, TypeScript strict, static output, zero client JS. Live at `https://off-the-happy-path.vercel.app`; every push to `main` deploys. PR previews sit behind Vercel login, so an agent can't curl them.
- CI runs `check`, `test` and `build` on every PR and push to `main`. 143 Vitest tests.
- `src/lib`: `posts.ts` (`getPosts`, the only draft rule), `entries.ts` (`slugFromId`, `padEntryNo`, `formatEntryNo`), `home.ts` (`POST_TYPES`, `homeEntries`, `postsOfType`, `entryMeta`, `entrySummary`, `navItemForType`), `tags.ts` (`tagLabel`, `tagCounts`, `tagHref`), `contrast.ts`, `dates.ts`, `reading-time.ts`.
- `src/components`: `Masthead`, `SiteNav` (tagline row plus `nav aria-label="Main"`, `active` prop), `LogHeader`, `FeaturedEntry`, `EntryRow` (`level` prop), `EntryMetaColumn`, `Stamp`, `CurrentlyBox`, `HomeAside`, `Footer`.
- `src/data/site.ts` holds all page copy, the nav items, email and GitHub. Mono labels are stored in sentence case and set in capitals with CSS.
- `global.css`: tokens, `.container` (1180px, 40/32/56 padding; 20/16/40 under 480px), `.label`, `.label--small`, `.columns`, `.log`. The highlighter is drawn as a thick underline (no shadows allowed).
- `src/pages/log/[slug].astro` is still the bare M0 page. There is no `PostLayout` yet.
- Posts: `001-hello-log` (note, published, has a `confidence`), `002-draft-example` (essay, draft), `003-deploy-check` (note, published throwaway). Production lists № 003 and № 001.
- RSS (`/rss.xml`), tag links (`/tag/<slug>/`) and `/archive/` are linked already and 404 until M4. That's expected.

## Design reference
The Post artboard (`Post.dc.html`) on the "Off the Happy Path — blog design" canvas: https://claude.ai/artifact/GK34FStGk8f8USEThnYXLq. Read its source for exact sizes (the Artifact tool's read action with `path: "project/Post.dc.html"`). Ignore its Google Fonts `<link>`. The Style sheet artboard (`Style.dc.html`) shows the sidenote and stamp pieces. Inside the same 1180px container, with 28px / 32px / 56px padding, top to bottom:

1. **Compact header** (the page's one `header`): the site name as a link to `/` on the left (Archivo 900, `font-stretch: 72%`, 26px, uppercase, 0.01em tracking), and the main nav on the right (same items and active styling as M2). A 2px ink rule below, 14px under the content. No tagline on post pages.
2. **Title block**, max 900px wide, padding 56px top and 36px bottom, a 1px ink rule below:
   - Kicker: mono 13px pencil, 0.08em tracking: `№ 015 · [ESSAY stamp at 11px] · FILED 2026-11-12`.
   - Title (`h1`): Archivo 900, `font-stretch: 76%`, 84px, line-height 0.95, -0.015em tracking.
   - Dek: italic serif 25px, line-height 1.4, max 720px.
3. **Three columns** in a row, 40px below the title block, with a 32px / 48px gap:
   - **Meta column** (`aside aria-label="Entry details"`, about 170–200px): a `<dl>` in mono 13px under a 2px ink top rule. Rows are separated by hairlines, 9px padding, labels mono 10.5px pencil with 0.1em tracking. Rows: ENTRY `015`, FILED `2026-11-12`, REVISED (the date, or `—` when there is none), READING TIME `9 min`, FILED UNDER (tag links), and CONFIDENCE (only when the post has one).
   - **Article**, max 660px: serif 20px, line-height 1.68, paragraphs 24px apart. `h2` in Archivo 800, `font-stretch: 85%`, 30px, 44px above and 14px below.
   - **Sidenote margin**, about 200–240px: the notes in mono 12.5px, line-height 1.55, in `--pen`. Each note has a 1.5px pen top rule, 10px above the text, and starts with its number in bold. Each sits level with its reference in the text.
4. **Footnote references**: mono 12px, weight 600, `--pen`, superscript.
5. **Code "file" box** (a `figure`): 1.5px ink border. The `figcaption` bar holds the title on the left and an optional note on the right (`TICKET-4127.md` … `AS WRITTEN`): mono 11.5px pencil, 0.08em tracking, uppercase, 7px / 14px padding, with a 1.5px ink rule below it. Then the `pre`: mono 15px, line-height 1.7, 14px vertical padding, 16px side padding per line, scrolling sideways on overflow. A highlighted line gets a full-width `--highlighter` background.
6. **Highlight in body text**: the artboard's `<span>` with `box-shadow: inset 0 -0.34em 0` becomes `<mark>` written in the Markdown.
7. **Reply box** (`section aria-label="Reply"`), 48px above: a 2px ink border, 18px / 20px padding, a mono 11px `REPLY` label, then serif 18px: `Disagree? Good. Email me with the subject line “Re: № 015.” I read all of it and answer most of it.` "Email me" is a `--pen` `mailto:` link with the subject already filled in.
8. **Previous / next** (`nav aria-label="More entries"`), 28px below: form cells (a 2px ink border, 2px ink gaps), two cells side by side that wrap on narrow screens. The left cell holds `← PREVIOUS · № 014` (mono 11px pencil label) and the title (Archivo 750, `font-stretch: 85%`, 19px). The right cell holds `NEXT →` and the title. When there is no neighbour, the cell isn't a link and shows italic pencil serif 17px: "Not written yet." for next on the newest entry, and a similar line for previous on the oldest (copy in `site.ts`).
9. **Footer**: the M2 `Footer`, 64px above.

## In scope
- **`src/layouts/PostLayout.astro`** wraps `BaseLayout` (title = post title, description = dek) and lays out the page above. `log/[slug].astro` becomes a thin page: it fetches posts, finds the neighbours, renders the content, and passes props.
- **Components in `src/components/`**, with typed props and no data fetching: `SiteHeader` (compact header with nav; reuse `site.nav`), `PostKicker` (or fold it into the layout), `PostMeta` (the `<dl>`), `CodeFigure` styles if the box needs a component, `ReplyBox`, `PrevNext`. Reuse `Stamp` and `Footer`. Pull the nav list out of `SiteNav` into its own small component if both headers need it, rather than copying it.
- **Pure helpers in `src/lib`, with Vitest tests:**
  - `prevNext(posts, no)`: returns `{ previous, next }` from newest-first posts, where previous is the next-older entry and next the next-newer. Each is `null` at its end of the log. It works on whatever list `getPosts` returns, so drafts take part in dev only.
  - `replyHref(email, no)`: `mailto:` with the subject `Re: № 015`, URL-encoded.
  - `postMeta(post, minutes)` (or similar): the meta rows in order, with `—` for no revised date and no CONFIDENCE row when it's absent.
  - `parseCodeMeta(raw)`: reads `title="…"` and `note="…"` from a fence's meta string (quotes allowed inside the other quote type). Line ranges like `{3}` or `{1,4-6}` are left to the highlight transformer.
- **Sidenotes: `src/lib/rehype-sidenotes.ts`**, a local rehype plugin registered in `astro.config.mjs`. It reads the GFM footnotes Astro already produces (`sup` > `a[data-footnote-ref]` and `section[data-footnotes]`). For each reference it adds a sidenote right after the `sup` in the same paragraph: a `<span class="sidenote">` holding the number and the note's content as phrasing content. Block content is flattened: paragraphs joined with `<br>`, and the back-reference link removed. It keeps the end-notes section. CSS then shows exactly one of the two:
  - Wide screens (the three-column layout fits; find the breakpoint, around 1100px): sidenotes float into the right margin with a negative right margin, level with their reference line. `clear: right` stacks notes that would collide. The end-notes section is `display: none`.
  - Narrower screens: sidenotes are `display: none` and the end notes show at the end of the article, styled like the margin notes (mono, pen, numbered).
  - Because the hidden copy is `display: none`, screen readers only ever get one. The reference link must point at whichever copy is visible. Simplest: the `href` points at the end note, and the sidenote sits right after the reference so it reads in place. Note what you chose under Decisions.
  - Test the plugin on hast built from real Markdown (unified + remark-parse + remark-gfm + remark-rehype, as Astro does): one note, two notes, a note with two paragraphs, a note with inline code and a link, a reference reused twice, and a post with no footnotes (output unchanged).
- **Code blocks:**
  - A custom Shiki theme so code uses only the tokens. Prefer Shiki's CSS-variables theme (`createCssVariablesTheme`) with the variables mapped to `--ink`, `--pencil` and so on in `global.css`, so hex values stay only in the token block. Suggested mapping: ink for nearly everything, pencil for comments and punctuation, nothing in pen (pen is the author's voice, not syntax).
  - A Shiki transformer that wraps a fence that has a `title` (via `parseCodeMeta`) in the `figure` / `figcaption` box. A fence without a title still gets the bordered box, just without the caption bar.
  - Line highlights from `{3}`-style meta via `transformerMetaHighlight` from `@shikijs/transformers` (add it as a dependency), styled as a full-width `--highlighter` line.
  - Code box background is `--paper` (see Constraints).
- **`<mark>`** in posts gets the same lower-third highlighter band as the M2 featured title (thick `text-decoration`, no shadow). Move the band into one shared class or rule in `global.css` instead of keeping two copies.
- **Sample post `004-nobody-reads-the-ticket.md`**, published, made with `npm run new` and filled by hand. Use the artboard's copy: two footnotes, the `<mark>` sentence, an `h2`, the `TICKET-4127.md` code box with `note="As written"` and line 3 highlighted, tags `process` and `requirements`, and confidence "Opinion, lightly held". Add a few more paragraphs of sample text after the code box so the second sidenote has room. It's sample content and M5 removes it (see Needs Tony).
- **Nav on post pages:** the active item follows the post's type, using `navItemForType` (NOTES for notes, WRITING otherwise).
- **Copy in `site.ts`:** the meta labels, the kicker's "Filed", the reply label and sentence parts, the previous/next labels, and both end-of-log lines.

## Out of scope (do not build)
- Tag pages, archive, About, 404, RSS, sitemap, canonical and OG tags, and the tag display-name map (M4). FILED UNDER on posts uses `tagHref` and `tagLabel` as they are.
- Print styles, Lighthouse pass, favicon, removing sample posts (M5).
- Any client JS: no sidenote toggles, no copy-code button.
- Changing the home page beyond what moving the shared nav or highlighter rule needs.

## Carry-over from M2
- Run everything on Node 26 (`nvm use`); the default shell Node here is 22. Check each pre-commit run by its exit code, never by piping into `grep`.
- Pushing over HTTPS fails in a plain shell (no stored git credentials). When Tony asks for a push, use `gh` for that one command: `git -c credential.helper= -c 'credential.helper=!gh auth git-credential' push`. Don't change the git config.
- Screenshots: install `playwright-core` in the session scratchpad (not the repo), drive the system Chrome (`/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`) against `astro preview`, take full-page shots, and check `scrollWidth == clientWidth`. To compare against the artboard, render `Post.dc.html` as static HTML: drop `support.js` and the `x-dc` script, and replace `{{pen}}` with `#B3190F`.
- Keep the M2 conventions: copy in `site.ts`, mono labels in sentence case with CSS capitals, logic in `src/lib`, components with typed props.

## Constraints
- **Five colors only**, plus `--hairline`. The artboard's code box background `#F8F8F5` and its dek color `#2B2A27` are not tokens: use `--paper` and `--ink`. Don't add a sixth color. Record this under Decisions.
- **No shadows, gradients or rounded corners.** The artboard's body highlight uses `box-shadow: inset`; use the thick-underline band from M2 instead. Highlighted code lines are a plain `--highlighter` background, which is fine.
- **Fonts from `@fontsource` only.**
- **Layout:** lines and boxes only, asymmetric, nothing centered except the container. The article column stays left of the margin notes.
- **Responsive:**
  - At 1280px the page matches the artboard, with the sidenotes in the right margin.
  - Between the sidenote breakpoint and phone width: meta column left, article right, end notes at the bottom of the article.
  - At 390px and down to 360px: the meta column goes above the article (compact, e.g. two columns of rows), the title scales down with `clamp()`, the header nav wraps under the name, the prev/next cells stack, and code scrolls sideways inside its box, never the page.
  - Side gutter of at least 16px and no horizontal page scroll.
- **Accessibility:** one `header`, one `main` (wrapping title block and columns), `nav aria-label="Main"`, `nav aria-label="More entries"`, `aside aria-label="Entry details"`, and one `footer`. Heading order: `h1` title, `h2` in the body (Markdown `##`), no skipped levels from the layout. Footnote references and back-links keep accessible names. Visible `:focus-visible` in `--pen`. Contrast at least 4.5:1, including ink on the highlighter line.
- **Zero client JS:** no `<script>` in built pages and no `.js` in `dist`.
- **Commits:** branch `feature/postPageDesign` from an up-to-date `main`, one commit per logical step. Before each commit run `npm test`, `npm run check` and `npm run build`, and require each to exit 0.

## Done when
- [ ] The sample post (№ 004) matches the Post artboard at 1280px: compact header, kicker with stamp, title and dek, meta column, body type, code box with title, note and highlighted line, `<mark>`, sidenotes in the margin, reply box, prev/next, footer. It reads well at 390px and 360px with no horizontal scroll. Verify with headless-browser screenshots at 1280, 390 and 360 against a render of the artboard, and record the comparison.
- [ ] On wide screens each sidenote's top sits level with its reference line, measured with the browser (element positions) rather than by eye. On narrow screens the end notes show and the sidenotes don't, with no JS. Verify with screenshots and computed `display` values at 1280 and 390.
- [ ] Previous and next are correct at both ends of the log: the newest post shows "Not written yet." for next, the oldest shows its end line for previous, and a middle post links both ways. Checked in the built HTML for № 004, № 003 and № 001.
- [ ] The reply link is a `mailto:` to the real address with the subject `Re: № 004`.
- [ ] Code uses only token colors: the Shiki theme sets no hex values outside `global.css`, and `grep` over `src/` finds only the token declarations, with no `box-shadow`, `border-radius` or gradient.
- [ ] No client JS: built pages contain no `<script>` and `dist` contains no `.js` files.
- [ ] Landmark and contrast checks pass on every built post page: exactly one `header`, `main` and `footer`, the labelled navs and aside listed above, and the contrast test covers any new text and background pair.
- [ ] Tests pass for the new behavior: the sidenote plugin cases listed in scope, `prevNext`, `replyHref`, `postMeta`, and `parseCodeMeta`. CI is green on the PR.
- [ ] progress.md is complete and status is COMPLETE.

## Needs Tony
- **Sample post goes live:** № 004 "Nobody reads the ticket" is published with the artboard's sample copy, so it shows on production (and becomes the featured entry on the home page) until M5 removes it, like № 003. If Tony would rather not show it on production, keep it a draft and verify against `astro dev` instead. In that case the build-output checks need a temporary published copy that is never committed.
- **Visual sign-off:** the agent compares screenshots against the artboard, but Tony gets the final say via the PR preview or production after the merge.

## Suggested order of work
1. Create `feature/postPageDesign` from `main`. Reset progress.md for M3 using this kickoff's Done-when list.
2. `prevNext`, `replyHref` and `postMeta` in `src/lib`, test-first.
3. `parseCodeMeta`, the Shiki CSS-variables theme, the title-box transformer and `transformerMetaHighlight`, wired in `astro.config.mjs`, with tests.
4. `rehype-sidenotes` with its tests, registered in `astro.config.mjs`.
5. The sample post № 004 via `npm run new`, filled with the artboard copy and every writing feature.
6. Move the shared nav list and the highlighter rule into shared places; add `SiteHeader`.
7. `PostLayout` with the title block, `PostMeta` and article typography; rebuild `log/[slug].astro` on it.
8. Code box, `<mark>`, sidenote and end-note CSS, including the breakpoint.
9. `ReplyBox` and `PrevNext`.
10. Responsive pass at 390px and 360px.
11. Verify: screenshots against the artboard, sidenote alignment measurements, prev/next at both ends, the `grep` design audit, no-JS and landmark checks.
12. Record how each Done-when item was verified in progress.md and set status COMPLETE.
