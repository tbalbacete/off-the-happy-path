# Progress

**Current milestone:** M3 - Post page to design
**Status:** IN PROGRESS   <!-- IN PROGRESS | BLOCKED | COMPLETE -->
**Kickoff:** docs/kickoffs/M3-kickoff.md
**Branch:** `feature/postPageDesign`

M0's, M1's and M2's records are in git history (`progress.md` as of commits 084f458, 9406219 and ef48ec2).

## Done-when checklist
- [ ] The sample post (№ 004) matches the Post artboard at 1280px: compact header, kicker with stamp, title and dek, meta column, body type, code box with title, note and highlighted line, `<mark>`, sidenotes in the margin, reply box, prev/next, footer. It reads well at 390px and 360px with no horizontal scroll.
- [ ] On wide screens each sidenote's top sits level with its reference line, measured with the browser. On narrow screens the end notes show and the sidenotes don't, with no JS.
- [ ] Previous and next are correct at both ends of the log (№ 004, № 003, № 001 in the built HTML).
- [ ] The reply link is a `mailto:` to the real address with the subject `Re: № 004`.
- [ ] Code uses only token colors; `grep` over `src/` finds only the token declarations, with no `box-shadow`, `border-radius` or gradient.
- [ ] No client JS: built pages contain no `<script>` and `dist` contains no `.js` files.
- [ ] Landmark and contrast checks pass on every built post page.
- [ ] Tests pass for the new behavior: sidenote plugin cases, `prevNext`, `replyHref`, `postMeta`, `parseCodeMeta`. CI is green on the PR.
- [ ] progress.md is complete and status is COMPLETE.

## Completed
- `src/lib/post.ts`: `prevNext` (neighbours in a newest-first list; throws for an unknown entry), `replySubject` / `replyHref` (`mailto:` with `Re: № 015` URL-encoded), `postMeta` (the entry-details rows, `—` for no revised date or no tags, CONFIDENCE only when set). Copy in `site.post`. Tests in `tests/post.test.ts`.
- `src/lib/code.ts`: `parseCodeMeta`, a Shiki CSS-variables theme (`--code-*`, mapped to the tokens in `global.css`; comments and punctuation pencil, the rest ink), `transformerCodeFigure` (wraps every block in `figure.code-box`, with a `figcaption` title/note bar when the fence has a title) and `transformerMetaHighlight` for `{3}` lines. Wired in `astro.config.mjs`. Tests in `tests/code.test.ts`, run through Shiki itself.
- `src/lib/rehype-sidenotes.ts`, registered in `astro.config.mjs`. Tests in `tests/rehype-sidenotes.test.ts` on hast built with unified + remark-parse + remark-gfm + remark-rehype: one note, two notes, a two-paragraph note, inline code and a link, a reference used twice, no footnotes (unchanged), end notes unchanged, and the note copied rather than moved.
- Sample post `004-nobody-reads-the-ticket.md` made with `npm run new` and published with `npm run publish -- 4`: the artboard copy, two footnotes, `<mark>`, an `h2`, the `TICKET-4127.md` box with `note="As written"` and line 3 highlighted, tags, confidence, and four more paragraphs after the code box.
- `MainNav` (the `nav aria-label="Main"` list) is shared by `SiteNav` (home and type pages) and the new compact `SiteHeader` (post pages). The highlighter band is one rule in `global.css` for `.highlight` and `mark`.

## Decisions
- **Posts use the `unified()` Markdown processor from `@astrojs/markdown-remark`.** Astro 7 defaults to Sätteri, its new Markdown pipeline. The kickoff's plan (GFM footnotes as `data-footnote-ref` / `section[data-footnotes]`, a local rehype plugin, Shiki transformers) is built on remark/rehype, so opting back in was the smallest change. Sätteri would need its own plugin API.
- **The Shiki theme is Shiki's own `createCssVariablesTheme` with a `--code-` prefix**, not the built-in `css-variables` string (which uses Astro's `--astro-code-` prefix), so the variable names are ours. Font styles are off, so the Markdown heading in the code box isn't bold (as in the artboard).
- **A note referenced more than once gets one sidenote, at its first reference.** A second copy in the margin would just repeat it. The end note keeps both back-links.
- **The footnote link keeps pointing at the end note.** The sidenote sits right after the reference, so on wide screens it reads in place even though the link's target is hidden.
- **The sample post's second note uses typed curly quotes**, because SmartyPants turns `"//` into a closing quote.

## Deviations / deferred

## Known issues
- This machine's default shell Node is 22. The repo needs 26 (`.nvmrc`); run `nvm use` first.

## Plan changes to consider

## Notes for the next kickoff
