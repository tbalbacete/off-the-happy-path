# Off the Happy Path — Build Plan

A personal blog by **Tony Albacete** about software engineering as it actually goes. Static site, Markdown posts, hosted free on Vercel.

Design reference: the "Off the Happy Path — blog design" canvas (Home, Post, Style sheet artboards).

---

## 1. Goals

1. **Publishing is easy.** Starting a post is one command. Publishing is a commit and a push.
2. **As simple as possible.** Static HTML output, no database, no CMS, no server code, almost no client-side JavaScript.
3. **$0 to run.** Vercel Hobby tier on the free `*.vercel.app` domain. GitHub for the repo. No paid services.
4. **Doesn't look generated.** Follows the engineering-logbook design exactly (see §6).
5. **Readers aren't tracked.** No analytics, cookies, third-party scripts, or remote font requests.

### Non-goals (for now)
- Comments (readers reply by email instead)
- Newsletter or email capture
- Search
- Custom domain (can be added later in Vercel settings without code changes)
- A CMS or web-based editor

---

## 2. Stack

| Concern | Choice | Why |
|---|---|---|
| Site generator | **Astro** (latest stable), static output | Markdown-first, ships zero JS by default, content collections validate frontmatter, first-class Vercel support |
| Language | TypeScript (strict) | Typed frontmatter and helpers |
| Styling | Plain CSS with custom properties (one global stylesheet + scoped component styles) | No framework needed for a site this size |
| Fonts | `@fontsource` packages (Archivo variable, Source Serif 4 variable, IBM Plex Mono), self-hosted | Free, no Google Fonts requests |
| Markdown | Astro's built-in Markdown (remark/rehype) + GFM footnotes | Footnotes become sidenotes |
| Code highlighting | Astro's built-in Shiki with a custom minimal theme matching the palette | No client JS |
| RSS / sitemap | `@astrojs/rss`, `@astrojs/sitemap` | Official, tiny |
| Tests | Vitest for helpers and scripts; `astro check` and `astro build` as gates | Simple and fast |
| Scripts | Plain Node (`.mjs`), no extra CLI dependencies beyond Node built-ins | Easy to read and change |
| Hosting | Vercel Hobby, Git-connected (push to `main` = deploy, PRs get preview URLs) | Free, zero config for Astro static |
| Node | Current LTS, pinned in `.nvmrc` and `package.json` `engines` | Matches what Vercel uses |

---

## 3. Architecture

```
/
├─ CLAUDE.md
├─ progress.md
├─ docs/
│  ├─ plan.md
│  └─ kickoffs/
├─ scripts/
│  ├─ new-post.mjs          # npm run new
│  ├─ publish-post.mjs      # npm run publish
│  └─ lib/                  # pure helpers shared by scripts (slugify, nextEntryNumber, frontmatter edit)
├─ templates/
│  └─ post.md               # the template new-post.mjs fills in
├─ src/
│  ├─ content.config.ts     # content collection + frontmatter schema
│  ├─ content/posts/        # one Markdown file per entry
│  ├─ data/
│  │  ├─ site.ts            # name, author, tagline, email, links
│  │  └─ currently.ts       # the "Currently" box (Shipping / Reading / Mildly annoyed by)
│  ├─ lib/                  # posts.ts (query, sort, filter drafts), reading-time.ts, dates.ts
│  ├─ components/           # Masthead, SiteHeader, EntryRow, Stamp, FormCells, CurrentlyBox, Footer, PrevNext, ReplyBox
│  ├─ layouts/              # BaseLayout, PostLayout
│  ├─ pages/
│  │  ├─ index.astro        # home: the log
│  │  ├─ log/[slug].astro   # a post
│  │  ├─ type/[type].astro  # Essays / Notes / Rants filter pages
│  │  ├─ tags/[tag].astro   # tag pages
│  │  ├─ archive.astro      # every entry, compact
│  │  ├─ about.astro
│  │  ├─ rss.xml.ts
│  │  └─ 404.astro
│  └─ styles/global.css     # tokens + base typography
├─ tests/                   # Vitest
└─ public/                  # favicon, OG image
```

**Routing:** posts live at `/log/<slug>/` (e.g. `/log/nobody-reads-the-ticket/`). The entry number is shown on the page, not in the URL, so renumbering never breaks links.

**Drafts:** `draft: true` posts render in `npm run dev` and are excluded from `npm run build`. One helper in `src/lib/posts.ts` is the only place that applies this rule.

---

## 4. Content model

One Markdown file per entry at `src/content/posts/<NNN>-<slug>.md`. The number prefix keeps the folder in log order. The URL uses only the slug.

### Frontmatter schema (validated in `content.config.ts`)

```yaml
---
no: 15                       # entry number, integer, unique, assigned by the script
title: "Nobody reads the ticket"
dek: "We write acceptance criteria like they are contracts…"   # one or two sentences shown on the home page
type: essay                  # essay | note | rant
date: 2026-11-12             # YYYY-MM-DD string; set when published
revised:                     # optional YYYY-MM-DD
tags: [process, requirements]
confidence: "Opinion, lightly held"   # optional; shown in the post's meta column
draft: true
---
```

Rules:
- `date` is stored and displayed as a plain `YYYY-MM-DD` string, never converted through a timezone.
- Reading time is computed at build time (about 230 words per minute, rounded up, at least 1). It is not stored.
- Tags are lowercase slugs in frontmatter. Display names come from a small map in `site.ts` (e.g. `ai` → "AI, honestly"), falling back to title case.
- The build fails if two posts share `no` or a slug.

### Writing features inside a post
- **Sidenotes:** write standard Markdown footnotes (`text[^1]` … `[^1]: note`). On wide screens they render in the right margin in red pen, next to their reference. On narrow screens they render as notes at the end of the post. Implement with a small local rehype plugin plus CSS; no client JS.
- **Highlighter:** write `<mark>…</mark>` in Markdown. Style guide: once per post at most.
- **Code blocks:** fenced code with an optional title (` ```md title="TICKET-4127.md" `) renders in the bordered "file" box from the design. Line highlighting (`{3}`) uses the highlighter color.

---

## 5. The new-post workflow

### `npm run new`
Interactive (Node `readline`), or non-interactive with flags:

```
npm run new                                   # prompts for everything
npm run new -- "Estimates are apologies in advance" --type rant --tags process,meetings
```

It:
1. Prompts for **title**, **type** (essay / note / rant, default essay), **tags** (comma-separated, shows existing tags), and **dek** (optional; can be filled in later).
2. Assigns the next entry number (highest existing `no` + 1, drafts included).
3. Slugifies the title (lowercase, ASCII, hyphens, stop at ~60 characters on a word boundary). Refuses to overwrite an existing slug.
4. Fills `templates/post.md` and writes `src/content/posts/<NNN>-<slug>.md` with `draft: true` and today's date.
5. Prints the file path and the local preview URL (`http://localhost:4321/log/<slug>/`).

`templates/post.md` is a plain Markdown file with `{{placeholders}}` and a few comments reminding you of sidenote, highlighter and code-title syntax. You can edit it to change what every new post starts with.

### `npm run publish -- <slug-or-number>`
1. Finds the post by slug or entry number.
2. Sets `draft: false` and `date` to today (or keeps an existing date with `--keep-date`).
3. Runs `astro check` and a build so a broken post never gets pushed.
4. Prints the git commands to commit and push. It does not run git itself.

### Day-to-day loop
```
npm run new          # answer prompts → draft file created
npm run dev          # write, preview at localhost:4321
npm run publish -- 16
git add . && git commit -m "Entry 016" && git push   # Vercel deploys in about a minute
```

Editing a published post: change the file, optionally set `revised:`, and push.

---

## 6. Design rules and conventions

These come from the canvas style sheet. Kickoffs restate the ones that apply.

**Color (five, no more), as CSS custom properties in `global.css`:**
- `--paper: #F2F2EE` (background)
- `--ink: #111111` (text, rules)
- `--pencil: #55534D` (secondary text, labels)
- `--pen: #B3190F` (the author in the margin: sidenotes, active nav, RANT stamp, key links)
- `--highlighter: #FFE14D` (`<mark>`, highlighted code lines; once per page at most)
- Hairline divider `#C4C2B9` is the one allowed neutral tint.

**Type:**
- Headlines: Archivo, condensed (`font-stretch` about 72–85%), weight 750–900.
- Body: Source Serif 4, about 20px in posts and 17px in lists, line-height about 1.6.
- Metadata, labels, stamps, code: IBM Plex Mono, small caps-style uppercase with 0.06–0.12em letter spacing.

**Shapes and structure:**
- Lines and boxes only: 2px ink rules for structure, 1px hairlines between rows, form cells built with a 2px-gap ink background.
- No cards, shadows, rounded corners, gradients, hero images, stock photos, emoji, icon grids, or "features" sections.
- Everything is numbered and dated: `№ 015`, `2026-11-12`.
- Asymmetric layout: content left, margin right. Nothing centered.
- Stamps (ESSAY / NOTE / RANT): mono 10.5px, 1.5px border, rotated -2°. RANT uses `--pen`.

**Behavior:**
- No newsletter pop-up, cookie banner, analytics, or third-party script.
- Zero client JS unless a milestone explicitly justifies it. The one exception so far is M6's copy-link button on post pages: small, same-origin, and the page works without it.
- Works at 360px wide: header cells wrap, aside drops below the log, sidenotes become end notes.
- Accessible: semantic landmarks (`header`, `nav`, `main`, `aside`, `footer`), real links, visible focus styles in `--pen`, text contrast ≥ 4.5:1, `lang="en"`.

**Code conventions:**
- Business logic (sorting, filtering drafts, reading time, slugify, next number) lives in pure functions under `src/lib` or `scripts/lib`, with Vitest tests.
- Components take typed props and contain no data fetching beyond `getCollection` in pages.
- Site-wide text (name, tagline, email, footer line) lives in `src/data/site.ts`, not hard-coded in components.

---

## 7. Hosting and deploy

1. Push the repo to GitHub (public or private both work on Hobby).
2. In Vercel, "Add New Project" → import the repo → framework preset Astro → deploy. No environment variables are needed.
3. Production URL: `off-the-happy-path.vercel.app` (or whatever name is free). Set `site` in `astro.config.mjs` to it so RSS and canonical URLs are absolute.
4. Every push to `main` deploys. Every PR or branch gets a preview URL.

Custom domain later: buy a domain, add it in Vercel → Domains, update `site`. No other changes.

---

## 8. Testing and verification

- `npm test`: Vitest for `src/lib/*` and `scripts/lib/*`, plus an integration test that runs the new-post and publish logic against a temp directory.
- `npm run check`: `astro check` (types and frontmatter schema).
- `npm run build`: must pass with zero warnings about content.
- Manual check per milestone: run `npm run dev` and compare against the canvas at 1280px and 390px.

---

## 9. Milestones

### M0 — Running skeleton
Create the Astro project (TypeScript strict, static output) with the folder layout from §3. Install and wire the three `@fontsource` fonts and the color and type tokens in `global.css`. Define the posts content collection with the full frontmatter schema, including the duplicate-number and duplicate-slug check. Add two sample posts (one published, one draft), a bare home page that lists published entries by number, and a bare post route at `/log/[slug]/` that renders the Markdown. Implement `src/lib/posts.ts` (published-only in builds, newest first) and `reading-time.ts` with Vitest tests. Add the npm scripts `dev`, `build`, `check`, and `test`, plus `.nvmrc`.
**Done when:** `npm run dev` serves the home page and both posts locally (the draft only in dev); `npm run build` succeeds and the built output excludes the draft; `npm run check` passes; `npm test` passes with tests for sorting, draft filtering, and reading time; an invalid frontmatter field fails the build with a clear message.

### M1 — New-post workflow and live deploy
Build `scripts/new-post.mjs`, `scripts/publish-post.mjs`, `scripts/lib/*` (slugify, next entry number, frontmatter read and write) and `templates/post.md` as specified in §5, exposed as `npm run new` and `npm run publish`. Write unit tests for the helpers and an integration test that creates and publishes a post in a temp directory. Connect the repo to Vercel, set `site`, and confirm a push deploys. Write a short `README.md` covering the day-to-day loop.
**Done when:** `npm run new` (interactive and with flags) creates a correctly numbered and slugged draft from the template and refuses duplicates; `npm run publish -- <n>` flips the draft, sets the date, and runs check and build; helper and integration tests pass; the site is live on a `vercel.app` URL; a post created with the script and pushed to `main` appears on the live site.

### M2 — Home page to design
Build the home page to match the Home artboard: the masthead form cells, the tagline and nav row, the "LOG" header with type filter links, the featured latest entry with the highlighter, the entry rows with number, date, and stamp, the aside (Currently box from `currently.ts`, Filed under, About this log, links), and the footer. Make it responsive per §6.
**Done when:** the home page matches the Home artboard at 1280px and reflows cleanly at 390px; the Currently box and site text come from `src/data`; the type filter links point to working `/type/essay|note|rant/` pages; there is no client JS on the page; contrast and landmark checks pass.

### M3 — Post page to design
Build `PostLayout` to match the Post artboard: compact site header, kicker line with stamp, big title and italic dek, left meta column (entry, filed, revised, reading time, filed under, confidence), the article body typography, the code "file" box with title and line highlights via a custom Shiki theme, `<mark>` styling, sidenotes from footnotes (margin on wide screens, end notes on narrow), the reply-by-email box, and previous/next navigation.
**Done when:** a sample post using every writing feature from §4 matches the Post artboard at 1280px and reads well at 390px; sidenotes line up with their references on wide screens and fall back to end notes on narrow screens without JS; previous and next links are correct at both ends of the log; tests cover the sidenote plugin and the prev/next helper.

### M4 — Navigation, feeds, and the rest of the pages
Add tag pages, the archive page, the About page, a styled 404, RSS at `/rss.xml` (full content of published posts), the sitemap, and per-page `<title>`, description, canonical URL, and Open Graph tags with one static OG image that fits the design. Add tag display names.
**Done when:** every tag and type link resolves; the RSS feed validates and excludes drafts; the sitemap lists every public page; the 404 page is styled; each page has correct meta tags; tests cover the tag and archive helpers.

### M5 — Polish and launch
Accessibility and performance pass (keyboard navigation, focus styles, Lighthouse), a favicon from the OTHP mark, print styles for posts, removing sample content, filling in real About copy and the Currently box, and a final review against the design rules in §6. Publish the first real entry using the script.
**Done when:** Lighthouse scores 100 for accessibility and best practices and 95+ for performance on home and post pages; every page is usable by keyboard alone; there are no sample posts in production; the first real entry is live; the design-rules checklist in §6 is verified page by page.

### M6 — Sharing
Add a SHARE box to the post page, between REPLY and MORE ENTRIES, built like the reply box: a 2px ink box with a mono label. It shows the post's permalink in mono as selectable text, then plain share links in `--pen`: Email (`mailto:` with the title as subject and the URL as body), LinkedIn (`share-offsite`), Bluesky (`intent/compose`) and X (`intent/post`). The links are ordinary `<a href>`s, so no widget scripts or third-party requests load until a reader clicks one. `shareLinks(url, title)` in `src/lib/share.ts` builds them, with Vitest tests for each network's encoding. Labels and the network list live in `site.post.share`. Add a COPY LINK button that copies the permalink to the clipboard. This is the site's one piece of client JS, justified because copying a link is the most common way to share: a small same-origin script, on post pages only, in the post's own bundle. It is progressive enhancement: the button renders `hidden` and the script reveals it, so readers without JS still get the selectable permalink. On success the label changes to COPIED for a few seconds and a polite live region announces it. If the clipboard is unavailable or fails, the script selects the permalink text instead. Then replace the single static OG image on posts with a generated 1200×630 card per post (№, type stamp, title, dek, in the logbook style with the three local fonts), made at build time; other pages keep `public/og.png`. The share box is hidden in print.
**Done when:** every published post has the share box with correct links for all four networks (tested); the copy button copies the exact canonical URL in Chrome, Safari and Firefox, announces it to screen readers, and is absent with JS disabled while the permalink stays selectable; the button is keyboard reachable with the `--pen` focus outline; home, list and other non-post pages still ship zero JS, and every page still makes only same-origin requests; each post's `og:image` points at its own card, which follows the §6 design rules and shows in a link-preview check; the share box doesn't appear in print; Lighthouse and the M5 audits still pass on a post page.
