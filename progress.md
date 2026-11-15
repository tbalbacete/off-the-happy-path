# Progress

**Current milestone:** M3 - Post page to design
**Status:** COMPLETE   <!-- IN PROGRESS | BLOCKED | COMPLETE -->
**Kickoff:** docs/kickoffs/M3-kickoff.md
**Branch:** `feature/postPageDesign` (PR #8)

M0's, M1's and M2's records are in git history (`progress.md` as of commits 084f458, 9406219 and ef48ec2).

## Done-when checklist
- [x] The sample post (№ 004) matches the Post artboard at 1280px and reads well at 390px and 360px with no horizontal scroll - verified by: headless Chrome (playwright-core in the session scratchpad, driving the system Chrome) full-page screenshots of `npm run build` + `astro preview` at 1280, 1100, 900, 390 and 360; `scrollWidth == clientWidth` at every width. `Post.dc.html` was rendered statically (no `support.js` or `x-dc` script, `{{pen}}` → `#B3190F`) and screenshotted at 1280. Element boxes line up: header (82, 28, 1116 wide) in both; h1 at y 169 vs 166; meta column x 82, 170 wide and article x 300, 650 wide in both; code box 650 wide, 164 vs 166 tall; reply box 117 vs 120 tall. Compact header, kicker with stamp, title, dek, meta rows, body type, code box (title, AS WRITTEN, line 3 highlighted), `<mark>` band, both sidenotes in the margin, reply box, prev/next and footer all match. Differences: the build's article is longer (the extra sample paragraphs the kickoff asked for), the previous cell is shorter because "Deploy check" fits on one line, text wraps slightly differently (self-hosted vs Google font metrics), and the artboard's first sidenote sits a line below its reference while the build puts it level, as the kickoff asks. At 390/360 the nav wraps under the name, the title drops to 40px, the meta column sits above the article in two columns, prev/next stack, and the end notes show. Visual sign-off is Tony's.
- [x] Sidenotes sit level with their reference line on wide screens; end notes replace them on narrow ones, with no JS - verified by: element positions in the browser. At 1280, note 1 top 483 vs reference top 486, note 2 top 969 vs 972 (the 3px is the superscript's raise); notes span x 998–1198 against an article ending at 950. At 1100 the same 3px offset. Computed `display`: at 1280 and 1100 `.sidenote` is `block` and `.footnotes` is `none`; at 1099 and 390 `.sidenote` is `none` and `.footnotes` is `block`. `document.scripts.length` is 0 at every width.
- [x] Previous and next are correct at both ends of the log - verified by: built HTML. № 004: previous `← Previous · № 003 Deploy check` linking `/log/deploy-check/`, next "Not written yet." (not a link). № 003: previous № 001 `/log/hello-log/`, next № 004 `/log/nobody-reads-the-ticket/`. № 001: previous "Nothing before this. It starts here." (not a link), next № 003.
- [x] The reply link is a `mailto:` to the real address with the subject `Re: № 004` - verified by: built HTML has `href="mailto:tbalbacete@gmail.com?subject=Re%3A%20%E2%84%96%20004"`; `tests/post.test.ts` decodes the subject back to `Re: № …`.
- [x] Code uses only token colors - verified by: `grep -rnoE '#[0-9a-fA-F]{3,8}' src` finds only the six declarations in `global.css`; no `rgb(` or `hsl(`; the built HTML has no hex in any `style` attribute (Shiki writes `var(--code-*)`); the built CSS has exactly the six token hex values; `grep -rnE 'box-shadow|border-radius|gradient' src` and the same over the built CSS find nothing. `tests/code.test.ts` also asserts Shiki's output has no hex.
- [x] No client JS - verified by: 0 of 7 built HTML files contain `<script`, and `find dist -name '*.js'` finds 0 files.
- [x] Landmark and contrast checks pass on every built post page - verified by: each of the three post pages has exactly 1 `<header`, 1 `<main`, 1 `<footer`, 1 `<nav aria-label="Main">`, 1 `<nav aria-label="More entries">` and 1 `<aside aria-label="Entry details">` (the only aside); heading order h1 then body h2s (plus the screen-reader-only "Footnotes" h2). The active nav item follows the type (NOTES on № 001 and № 003, WRITING on № 004). `tests/contrast.test.ts` gained pencil on highlighter (code comments on a highlighted line); every pair passes 4.5:1.
- [x] Tests pass for the new behavior. CI is green on the PR - locally verified: `npm test` passes 16 files / 179 tests (new: `post.test.ts` for `prevNext`, `neighbourLink`, `replyHref`, `postMeta`; `code.test.ts` for `parseCodeMeta` and the code box; `rehype-sidenotes.test.ts` with every case in scope; `postHref` in `entries.test.ts`). `npm run check` and `npm run build` exit 0 before every commit. CI `verify` (check, test, build) passed on PR #8, and the Vercel preview deployed.
- [x] progress.md is complete and status is COMPLETE - verified by: this file.

## Completed
- `src/lib/post.ts`: `prevNext` (neighbours in a newest-first list; throws for an unknown entry), `replySubject` / `replyHref` (`mailto:` with `Re: № 015` URL-encoded), `postMeta` (the entry-details rows, `—` for no revised date or no tags, CONFIDENCE only when set). Copy in `site.post`. Tests in `tests/post.test.ts`.
- `src/lib/code.ts`: `parseCodeMeta`, a Shiki CSS-variables theme (`--code-*`, mapped to the tokens in `global.css`; comments and punctuation pencil, the rest ink), `transformerCodeFigure` (wraps every block in `figure.code-box`, with a `figcaption` title/note bar when the fence has a title) and `transformerMetaHighlight` for `{3}` lines. Wired in `astro.config.mjs`. Tests in `tests/code.test.ts`, run through Shiki itself.
- `src/lib/rehype-sidenotes.ts`, registered in `astro.config.mjs`. Tests in `tests/rehype-sidenotes.test.ts` on hast built with unified + remark-parse + remark-gfm + remark-rehype: one note, two notes, a two-paragraph note, inline code and a link, a reference used twice, no footnotes (unchanged), end notes unchanged, and the note copied rather than moved.
- Sample post `004-nobody-reads-the-ticket.md` made with `npm run new` and published with `npm run publish -- 4`: the artboard copy, two footnotes, `<mark>`, an `h2`, the `TICKET-4127.md` box with `note="As written"` and line 3 highlighted, tags, confidence, and four more paragraphs after the code box.
- `PostLayout` (title block with kicker and stamp, `PostMeta`, article, Footer 64px below) and a thin `log/[slug].astro` that finds the neighbours in `getStaticPaths`. `postHref` in `entries.ts` (also used by `entrySummary`), `neighbourLink` in `post.ts`. `Stamp` gained a `large` prop for the 11px kicker stamp.
- `global.css`: `.prose` body typography, `.sr-only`, the code box, footnote references, sidenotes (floated into an empty third grid track) and end notes, with the swap at 1100px. `ReplyBox` and `PrevNext` (form cells; end-of-log lines in `site.ts`). Phones get 18px body text, 26px h2 and 14px code.
- Checked with a temporary post (never committed) that a long code line scrolls inside its box at 360 (1032px of content in a 326px box) with the highlight running the full scrolled width, and that a long title wraps in the caption bar.
- `MainNav` (the `nav aria-label="Main"` list) is shared by `SiteNav` (home and type pages) and the new compact `SiteHeader` (post pages). The highlighter band is one rule in `global.css` for `.highlight` and `mark`.

## Decisions
- **Posts use the `unified()` Markdown processor from `@astrojs/markdown-remark`.** Astro 7 defaults to Sätteri, its new Markdown pipeline. The kickoff's plan (GFM footnotes as `data-footnote-ref` / `section[data-footnotes]`, a local rehype plugin, Shiki transformers) is built on remark/rehype, so opting back in was the smallest change. Sätteri would need its own plugin API.
- **The Shiki theme is Shiki's own `createCssVariablesTheme` with a `--code-` prefix**, not the built-in `css-variables` string (which uses Astro's `--astro-code-` prefix), so the variable names are ours. Font styles are off, so the Markdown heading in the code box isn't bold (as in the artboard).
- **A note referenced more than once gets one sidenote, at its first reference.** A second copy in the margin would just repeat it. The end note keeps both back-links.
- **The footnote link keeps pointing at the end note.** The sidenote sits right after the reference, so on wide screens it reads in place even though the link's target is hidden.
- **The grid has three tracks (170px, up to 660px, 200px) and the sidenotes float into the empty third one** with a negative right margin, so they sit level with their reference line and `clear: right` stacks them. The sidenote breakpoint is 1100px (below it the article still gets about 570px); the meta column moves above the article at 720px.
- **Code titles keep their case** (`TICKET-4127.md`, as in the artboard); only the note is set in capitals.
- **Code box background is `--paper`** and the dek is `--ink`, not the artboard's `#F8F8F5` and `#2B2A27`, to stay at five colors.
- **The kicker's FILED and the end-of-log lines live in `site.post`**; the previous line on the oldest entry reads "Nothing before this. It starts here."
- **The sample post's second note uses typed curly quotes**, because SmartyPants turns `"//` into a closing quote.

## Deviations / deferred
- № 004 is published, so it shows on production (and is the home page's featured entry) once this merges, as the kickoff planned. M5 removes it with № 003.

## Known issues
- This machine's default shell Node is 22. The repo needs 26 (`.nvmrc`); run `nvm use` first.

## Plan changes to consider
- Astro 7's default Markdown processor is Sätteri. The site now opts into `unified()`; if a later Astro major drops the remark pipeline, the sidenote plugin and code transformers would need porting.

## Notes for the next kickoff
- M4: FILED UNDER on posts links to `/tag/<slug>/` with `tagLabel`, so the display-name map should feed `postMeta` too. RSS, tag pages and `/archive/` still 404.
- Reusable pieces: `SiteHeader` (compact header for any non-home page), `MainNav`, `.prose`, `PostMeta`, `postHref`.
- The screenshot rig (playwright-core in the session scratchpad) isn't in the repo.
