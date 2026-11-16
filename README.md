# Off the Happy Path

A personal blog about software engineering as it actually goes. Static Astro site, Markdown posts, deployed on Vercel.

## Setup

```sh
nvm use        # Node 26, from .nvmrc
npm install
```

`npm run publish` and `npm run og` also need Google Chrome. They use the one at `/Applications/Google Chrome.app` unless `CHROME_PATH` points somewhere else (any Chrome or Chromium binary).

## Writing a post

```sh
npm run new                 # asks for title, type, tags and dek
npm run dev                 # write, and preview at http://localhost:4321
npm run publish -- 16       # or the slug: npm run publish -- the-slug
git add src/content/posts/016-the-slug.md public/og/the-slug.png
git commit -m "Entry 016"
git push                    # Vercel deploys main in about a minute
npm run og -- 16            # later, after changing its title or dek: remake the card
```

**`npm run new`** creates `src/content/posts/<NNN>-<slug>.md` as a draft dated today, with the next entry number. It prints the file path and the local preview URL. To skip the prompts, use flags:

```sh
npm run new -- "Estimates are apologies in advance" --type rant --tags process,meetings --dek "..."
```

The type is `essay`, `note` or `rant` (essay by default). Tags are comma-separated and become lowercase slugs. The dek is optional at this point, but `publish` won't accept the placeholder, so write one before publishing. It refuses a title whose slug is already taken.

New posts start from `templates/post.md`. Edit it to change what every new post starts with. The comments in its frontmatter list the sidenote, highlighter and code-title syntax, and never render.

Drafts show up in `npm run dev` and are left out of the production build.

**`npm run publish -- <number-or-slug>`** first renders the post's share card to `public/og/<slug>.png` (see below). Then it sets `draft: false` and `date:` to today (add `--keep-date` to keep the existing date), and runs `npm run check` and `npm run build`. If the card can't be made (Chrome missing, say), nothing changes. If check or build fails, the post and its card are put back exactly as they were and the command exits non-zero. On success it prints the git commands. It never runs git itself.

## Share cards and the share strip

Every post page has a SHARE strip just under the title: a COPY LINK button and icon links for email, LinkedIn, Bluesky and X. The button is the site's only JavaScript and appears only on post pages; readers without JavaScript don't see it. If the clipboard isn't available, the button shows the link and selects it instead. The strip's text, including each icon's accessible name, lives in `site.post.share` in `src/data/site.ts`, and the icons in `src/lib/share-icons.ts`.

When a post is shared, the preview uses its own card (1200×630) from `public/og/<slug>.png`. `npm run publish` makes it. To remake one by hand:

```sh
npm run og -- 16        # or the slug
npm run og -- --all     # every published post
```

The card's layout is `ogCardHtml` in `scripts/lib/og-card.mjs`. A production build fails if a published post has no card, so a post published by hand can't go out with the wrong preview.

## Editing a published post

Change the file, set `revised:` to today's date (`YYYY-MM-DD`) if the change is more than a typo, then commit and push. If you changed the title or dek, remake its card with `npm run og -- <n>` and commit the PNG too. Keep the entry number and the file name: the URL comes from the file name, so renaming the file breaks links.

## Checks

```sh
npm test         # Vitest: src/lib, scripts/lib, and a new-and-publish integration test
npm run check    # astro check: types and frontmatter schema
npm run build    # static build into dist/
npm run links    # internal links in dist/ resolve
```

CI runs all four on every pull request and every push to `main`.

## Where things are

- `docs/plan.md`: the full build plan, including the design rules (§6).
- `docs/kickoffs/`: the brief for each milestone.
- `progress.md`: what actually happened in the current milestone.
- `scripts/`: the `new`, `publish` and `og` commands, with their helpers in `scripts/lib/`.
- `public/og/`: one share card per published post.
- `src/content/posts/`: one Markdown file per entry.
