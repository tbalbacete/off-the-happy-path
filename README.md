# Off the Happy Path

A personal blog about software engineering as it actually goes. Static Astro site, Markdown posts, deployed on Vercel.

## Setup

```sh
nvm use        # Node 26, from .nvmrc
npm install
```

## Writing a post

```sh
npm run new                 # asks for title, type, tags and dek
npm run dev                 # write, and preview at http://localhost:4321
npm run publish -- 16       # or the slug: npm run publish -- the-slug
git add src/content/posts/016-the-slug.md
git commit -m "Entry 016"
git push                    # Vercel deploys main in about a minute
```

**`npm run new`** creates `src/content/posts/<NNN>-<slug>.md` as a draft dated today, with the next entry number. It prints the file path and the local preview URL. To skip the prompts, use flags:

```sh
npm run new -- "Estimates are apologies in advance" --type rant --tags process,meetings --dek "..."
```

The type is `essay`, `note` or `rant` (essay by default). Tags are comma-separated and become lowercase slugs. The dek is optional at this point, but `publish` won't accept the placeholder, so write one before publishing. It refuses a title whose slug is already taken.

New posts start from `templates/post.md`. Edit it to change what every new post starts with. The comments in its frontmatter list the sidenote, highlighter and code-title syntax, and never render.

Drafts show up in `npm run dev` and are left out of the production build.

**`npm run publish -- <number-or-slug>`** sets `draft: false` and `date:` to today (add `--keep-date` to keep the existing date). Then it runs `npm run check` and `npm run build`. If either fails, the post is put back exactly as it was and the command exits non-zero. On success it prints the git commands. It never runs git itself.

## Editing a published post

Change the file, set `revised:` to today's date (`YYYY-MM-DD`) if the change is more than a typo, then commit and push. Keep the entry number and the file name: the URL comes from the file name, so renaming the file breaks links.

## Checks

```sh
npm test         # Vitest: src/lib, scripts/lib, and a new-and-publish integration test
npm run check    # astro check: types and frontmatter schema
npm run build    # static build into dist/
```

CI runs all three on every pull request and every push to `main`.

## Where things are

- `docs/plan.md`: the full build plan, including the design rules (§6).
- `docs/kickoffs/`: the brief for each milestone.
- `progress.md`: what actually happened in the current milestone.
- `scripts/`: the `new` and `publish` commands, with their pure helpers in `scripts/lib/`.
- `src/content/posts/`: one Markdown file per entry.
