# M5: Polish and launch - Kickoff

## Goal
Get the site ready to launch: a keyboard and accessibility pass, Lighthouse scores to plan, print styles for posts, removing the sample content, Tony's Currently box, and a page-by-page review against the design rules in plan §6. Finish by publishing the first real entry, a rant about never making time for requirements, drafted by the agent with Tony (see "The first real entry" below). Still zero client JS.

## Starting point
M4 is complete and merged (PR #10, `c8f1bca`). From progress.md:
- Astro 7 on Node 26, TypeScript strict, static output, zero client JS. Live at `https://off-the-happy-path.vercel.app`; every push to `main` deploys. PR previews sit behind Vercel login, so an agent can't curl them.
- CI runs `check`, `test`, `build` and `links` on every PR and push to `main`. 224 Vitest tests.
- Pages: home, `/type/essay|note|rant/`, `/log/<slug>/`, `/tag/<slug>/`, `/archive/`, `/about/`, `404.html`, `/rss.xml`, `sitemap-index.xml`. Secondary pages use `PageLayout` (compact `SiteHeader`, `TitleBlock`, content, `Footer`); posts use `PostLayout`, which also uses `TitleBlock`.
- Every page gets its title, description, canonical, Open Graph and Twitter tags from `pageMeta` (`src/lib/meta.ts`) via `BaseLayout`. `public/og.png` (source `design/og.html`).
- **The favicon is already done.** Tony asked for it during M4: `public/favicon.svg` (the OTHP mark with the letters as paths), `favicon.ico` (16/32/48) and `apple-touch-icon.png` (180), linked in `BaseLayout`. Drop it from this milestone.
- `:focus-visible` is a 2px `--pen` outline with a 2px offset (`global.css`). There is no skip link.
- There are no print styles.
- Posts: № 004 "Nobody reads the ticket" (essay, the M3 sample with every writing feature), № 003 "Deploy check" (note, a throwaway that says "Removed before launch"), № 002 "A draft example" (draft, never built in production), № 001 "Hello, log" (note, tag `meta`, an intro post written as real copy).
- Placeholders: `src/data/currently.ts` holds the artboard's bracketed copy. `/about/` reuses the home aside's two paragraphs (`site.aside.about`). The 404 copy in `site.notFound` is the agent's.
- `site.tagNames` has only `ai: 'AI, honestly'`.
- Open from M4 (Plan changes to consider): a display name with a comma reads awkwardly in comma-separated tag lists ("4 MIN · AI, HONESTLY, PROCESS"); a tag named like a page ("notes", "archive") would duplicate that page's `<title>`.
- Not yet run: the W3C Feed Validator on the production feed, and an OG link-preview check.

## Design reference
No new artboards. The canvas at https://claude.ai/artifact/GK34FStGk8f8USEThnYXLq (`Main.dc.html`, `Post.dc.html`, `Style.dc.html`) and plan §6 are the reference for the design review. The Style sheet's "Rules, so it never looks generated" list is the checklist's starting point.

- **Skip link:** the first focusable element on every page, "Skip to content", linking to `#main` on the page's `main`. Hidden until focused (the `.sr-only` pattern, undone on `:focus-visible`), then shown top-left as a mono uppercase label on `--paper` with a 2px `--ink` border. No rounded corners, no shadow.
- **Print (posts only):** ink on the paper's own white (no `--paper` background), the title block, the meta column above the article as one compact block, the article, and the end notes. Hide the main nav, the reply box, previous/next and the sidenotes (the end notes carry the notes). Keep the footer's copyright line. Code boxes wrap long lines instead of clipping. External links in the article print their URL after the text. Avoid breaking inside code boxes and right after headings.

## In scope
- **Keyboard and focus.** Add the skip link (copy in `site.ts`) to `BaseLayout`, and `id="main"` on every page's `main`. Tab through every page type (home, type, post, tag, archive, About, 404) at 1280px and 390px and confirm: the skip link comes first and moves focus to `main`; every link and focusable element shows the `--pen` outline, unclipped (check inside the code box, the prev/next cells, the masthead and the highlighter band); the order follows the reading order; nothing is reachable that can't be seen; the scrollable code box can be focused and scrolled with the arrow keys (Shiki's `tabindex="0"`).
- **Lighthouse.** Install `lighthouse` in the session scratchpad (not the repo), run it with the system Chrome against `astro preview` on home, a type page, the M3 sample post (before it's removed) and the first real entry, using the default mobile configuration and then `--preset=desktop`. Take the median of three runs for performance. Fix whatever stops 100 for accessibility and best practices or 95 for performance. Font loading is the likely performance cost: subset or preload only if Lighthouse shows it matters, and record what changed and the before and after numbers.
- **No third-party requests.** With a request listener in the screenshot rig, load every page type and confirm every request goes to the same origin.
- **Print styles** for posts, as above, in `global.css` under `@media print` (or in `PostLayout`'s styles). Check with Chrome's print emulation (`page.emulateMedia({ media: 'print' })` screenshots) and a `page.pdf()` of a post with notes and a code box.
- **`public/robots.txt`**, allowing everything and naming `https://off-the-happy-path.vercel.app/sitemap-index.xml`.
- **Remove the sample content.** Delete № 002 (the draft example), № 003 (the throwaway) and № 004 (the M3 sample). Keep № 001 "Hello, log". Tony confirmed both. Before deleting № 004, run the Lighthouse, keyboard and print checks against it, since it is the only post with sidenotes, a code box and `<mark>`. After it's gone, check those features again with a temporary post that is never committed. Confirm `npm run links` still passes (the `process` and `requirements` tag pages go with № 004).
- **Real copy from Tony.** The About page keeps its current copy (`site.aside.about`); Tony approved it as is. Still needed: the Currently box values in `currently.ts`, any 404 wording changes, and any tag display names. The agent doesn't invent personal facts: ask for these at the start, build everything else meanwhile, and put Tony's words in verbatim. The first real entry is the one exception, below.
- **Design-rules review.** A page-by-page checklist in progress.md: rows for home, a type page, a post, a tag page, archive, About, 404, the OG image and the favicon; columns for each §6 rule that applies (five colors plus hairline, three fonts, lines and boxes only with no radius, shadow or gradient, no emoji, numbered and dated, asymmetric with nothing centered but the container, stamps to spec, highlighter at most once per page, `--pen` focus styles, works at 360px, landmarks, contrast, zero JS). Each cell says how it was checked (a grep over `src` and `dist`, a computed-style check, a screenshot). Fix anything that fails, or record it under Decisions if it's a deliberate exception. The M3 sample has both `<mark>` and a highlighted code line, so say how highlighted code lines count against "once per page".
- **The first real entry**, drafted by the agent and finished with Tony. See the next section. It is created with `npm run new` and published with `npm run publish -- 2` on this branch, so it ships with the merge. With № 002–004 removed, it is № 002.

## The first real entry: a rant about requirements
Tony asked the agent to draft most of this post. That's a deliberate exception to "the agent doesn't write Tony's copy"; record it under Decisions. Tony reads and edits all of it, and it's published only after he says it's ready.

**The argument.** Teams rarely set aside time for requirements. Developers get thin or missing requirements, start anyway because starting feels like progress, and later everyone asks why the work went sideways or took twice as long. Skipping that time doesn't save it. The cost moves later, where it's bigger and nobody sees where it came from. The post asks for one thing: count requirements work as real work and give it time.

**Tone.** It's a rant (the `--pen` RANT stamp) in energy, not in hostility. Assume Tony's coworkers, managers and future interviewers will read it and know who wrote it.
- Say "we", not "they". Developers are in it too: we start coding before asking questions, and we don't push back on vague tickets. Own that early in the post.
- Blame habits and incentives, never a role or a person. No villain PM, manager or client. Anyone who writes tickets should nod, not feel accused.
- Nothing that identifies an employer, team, product, client, person or timeline. Use composite or generic examples. The footer already says the opinions are his.
- The energy comes from specific, recognisable moments and short sentences, not insults, sarcasm aimed at people, profanity or capitals.
- Pair each complaint with something small and doable.
- Plain words, Tony's voice. No stock openers ("In today's fast-paced world"), no motivational wrap-up, no lists of three everywhere, no "it's not X, it's Y" in every paragraph. Read it aloud: it should sound like an engineer talking to a colleague.

**Shape** (a starting point; about 900–1,300 words):
1. **Open on a moment** most developers know. A ticket that's a title and a link to a meeting nobody recorded. A kickoff that ends with "we'll figure it out as we go". Use Tony's anonymised story if he gives one.
2. **The trade.** Skipping an hour of questions to "save time", and why it happens without anyone choosing it: deadlines are visible and requirements work isn't, it's nobody's job in particular, and asking questions can feel like slowing things down.
3. **Where the time goes.** Rework, mid-sprint Slack threads, a "quick question" that turns into a redesign, estimates that were never estimates of the real thing, QA finding the requirements. Then the retro asking why it took so long. Use `<mark>` once, on the post's central line (for example: skipping requirements doesn't save the time, it moves it somewhere nobody's looking).
4. **Our part.** Developers start coding because it feels like progress, and the happy path gets built first because it's the only path anyone described. This is the section that keeps the post from reading as an attack.
5. **What helps.** Small and concrete. Protect time for it in planning. Before starting, answer a few questions in the ticket: who it's for, what done looks like, what's out of scope, and what happens when things go wrong (ties to the blog's name). Write the answers down where the next person will find them. Treat "we don't know yet" as an answer worth writing down.
6. **Close.** Not asking for perfect specs or a waterfall, just for the time to be counted. End on a dry line, not a call to action.

**Writing features.** One code box: a before/after ticket (`title="TICKET.md"`, the empty version, then the same ticket with the four questions answered, the key line highlighted). One or two sidenotes in Tony's dry aside voice. `<mark>` once. Note that № 004's sample copy covers a neighbouring idea (the ticket versus the Slack thread). It's deleted in this milestone; the rant can reuse an observation from it but makes its own argument.

**Frontmatter to propose to Tony:** type `rant`; tags `requirements`, `process`; a working title such as "We never have time for requirements" or "We'll figure it out as we go"; a one-sentence dek; and a `confidence` line in his voice.

**Process.**
1. At the start, ask Tony: an anonymised story to open with (or permission to use a composite); the costs he's seen most (rework, slipped dates, bugs, burnout); one thing that has worked for him; anything off-limits; the title he prefers.
2. Create it: `npm run new -- "<title>" --type rant --tags requirements,process --dek "<dek>"`. It stays a draft while Tony reviews.
3. Draft it in the file. Wherever a personal fact is needed and Tony hasn't given one, leave a bracketed slot (`[a time this happened to you]`) rather than invent one. The "no bracketed placeholder text" check in Done when catches any left over.
4. Show it in `npm run dev`. Revise with Tony until he says it's ready. He reads the final text in full.
5. `npm run publish -- 2`, commit, and check the post page, feed item, tag pages and home page.

## Out of scope (do not build)
- Search, comments, a newsletter, analytics, a custom domain.
- A JSON feed, per-post OG images, pagination.
- New page types or redesigns beyond the skip link and print styles.
- Any client JS.
- Lighthouse SEO scores (not in the Done-when list); fix only what is free and obvious.

## Carry-over from M4
- Run everything on Node 26 (`nvm use`); the default shell Node is 22. Check each pre-commit run by its exit code, never by piping into `grep`.
- Push with `gh` for that one command: `git -c credential.helper= -c 'credential.helper=!gh auth git-credential' push`. Don't change the git config.
- Screenshots and browser checks: install `playwright-core` in the session scratchpad (not the repo), drive the system Chrome (`/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`) against `astro preview`, take full-page shots, and check `scrollWidth == clientWidth`.
- The M4 page audit lived in the scratchpad and is gone. It parsed every built page and checked: one `header`, `main`, `footer` and `nav aria-label="Main"`; exactly one `aria-current="page"` in the nav, with the expected item; one `h1`, first, and no skipped heading levels; `lang="en"`; no `<script>` and no `.js` in `dist`; a unique `<title>`, a description, the canonical (absolute, trailing slash, equal to `og:url`; none on the 404, which has `robots noindex`), and the Open Graph and Twitter tags. Recreate it and run it again at the end.
- When writing quotes that SmartyPants might curl the wrong way (such as `"//`), type the curly quotes yourself.
- Keep the conventions: copy in `site.ts`, mono labels in sentence case with CSS capitals, logic in `src/lib` or `scripts/lib` with tests, components with typed props and no data fetching.

## Constraints
- **Five colors only**, plus `--hairline`. Print may drop the `--paper` background but adds no colors.
- **No shadows, gradients or rounded corners.** Lines and boxes only, asymmetric, nothing centered but the container.
- **Fonts from `@fontsource` only.** No remote font requests, analytics, cookies or third-party scripts.
- **Responsive:** every page reads well at 1280, 390 and 360px, with a side gutter of at least 16px and no horizontal page scroll.
- **Accessibility:** landmarks, active nav and heading order as in M4; contrast at least 4.5:1 for any new text and background pair (the skip link included); `lang="en"` everywhere.
- **Zero client JS:** no `<script>` in built pages and no `.js` in `dist`.
- **Commits:** branch `feature/polishAndLaunch` from an up-to-date `main`, one commit per logical step. Before each commit run `npm test`, `npm run check`, `npm run build` and `npm run links`, and require each to exit 0.

## Done when
- [ ] Lighthouse scores 100 for accessibility and best practices and 95+ for performance (median of three) on the home page and a post page, mobile and desktop, against `astro preview`. Record the numbers. After the merge, the same run against production when Tony asks.
- [ ] Every page type is usable by keyboard alone: skip link first and working, visible `--pen` focus on every focusable element, logical order, scrollable code boxes reachable. Verified by tabbing in the browser and recorded with screenshots of the focus states.
- [ ] Posts print cleanly: no nav, reply box, prev/next or sidenotes; end notes, title, meta and article present; code wraps; external links show their URLs. Verified with print-emulation screenshots and a PDF.
- [ ] No sample posts in production: № 002, № 003 and № 004 are deleted, the built HTML, feed and sitemap contain none of them, and `npm run links` passes.
- [ ] The Currently box carries Tony's real values, the About page keeps its approved copy, and no bracketed placeholder text is left anywhere in `src` or `dist`.
- [ ] The design-rules checklist from plan §6 is filled in page by page in progress.md, with how each cell was checked, and every failure fixed or recorded as a decision.
- [ ] Every page makes only same-origin requests, and the M4 page audit passes again on every built page.
- [ ] The first real entry (№ 002, the requirements rant) follows the tone rules above, uses a code box, a sidenote and one `<mark>`, has Tony's explicit sign-off, is published with `npm run publish` on this branch, and is live on production after the merge.
- [ ] The production feed passes the W3C Feed Validator and the OG image shows in a link-preview check (after the merge, when Tony asks; record the result).
- [ ] Tests pass for any new logic. CI is green on the PR.
- [ ] progress.md is complete and status is COMPLETE.

## Needs Tony
- **Already settled:** the About page keeps its current copy; № 002, № 003 and № 004 are deleted and № 001 stays; the agent drafts the first entry.
- **Currently box:** what he's shipping, reading, and mildly annoyed by.
- **The first real entry:** answers to the questions in its Process list, edits to the draft, and the final sign-off.
- **Tag names:** any display names to add to `site.tagNames`. Also decide on the comma problem: keep "AI, honestly" and switch tag lists to a different separator, or drop the comma from the name. Default if no answer: leave both as they are.
- **404 wording:** optional; the agent's placeholder stays otherwise.
- **After the merge:** ask for the production Lighthouse run, the W3C feed check and the link-preview check.

If any of Tony's copy is missing when everything else is done, set status BLOCKED and list exactly what's missing.

## Suggested order of work
1. Create `feature/polishAndLaunch` from `main`. Reset progress.md for M5 using this kickoff's Done-when list. Ask Tony for the items under Needs Tony, including the questions for the first entry, so his answers arrive while the rest is built.
2. The skip link and `id="main"`, with the keyboard pass on every page type. Fix any focus problems.
3. Lighthouse baseline on home, a type page and № 004, mobile and desktop. Fix what keeps the scores below target.
4. Print styles for posts, checked on № 004.
5. `public/robots.txt`, and the same-origin request check.
6. Remove № 002, № 003 and № 004. Re-check sidenotes, code boxes and `<mark>` with a temporary post that is never committed.
7. Tony's copy: Currently, tag names, 404 changes.
8. The first real entry: create it with `npm run new`, draft it, revise with Tony, and `npm run publish -- 2` once he signs off.
9. The design-rules review, page by page; fix or record each failure.
10. Final verification: Lighthouse on home and the real entry, the keyboard pass, print, the M4 page audit, links, screenshots at 1280, 390 and 360.
11. Record how each Done-when item was verified in progress.md and set status COMPLETE (or BLOCKED with what's missing). The post-merge checks are recorded when Tony asks for them.
