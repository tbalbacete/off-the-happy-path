# Off the Happy Path

Personal blog by Tony Albacete. Static Astro site, Markdown posts, deployed free on Vercel. The full plan is in `docs/plan.md`; the design rules are in its §6.

## Iteration protocol (follow every session)

### Files
- `docs/plan.md` - the full build plan. Its Milestones section lists M0, M1, ... each with a scope and a Done when line. Reference, not a task list.
- `docs/kickoffs/M{n}-kickoff.md` - the brief for the current milestone. The only thing you build from.
- `progress.md` (repo root) - the running record of what actually happened. You keep it up to date.

### Rules
1. At session start, read CLAUDE.md, the current kickoff, and progress.md. Know which milestone is active before starting.
2. Build only what the current kickoff scopes. Things from later milestones go in progress.md under Deviations / deferred.
3. Update progress.md after each meaningful chunk of work, not only at the end.
4. A milestone is finished when every Done when criterion is met and verified (tests run, app started, behavior checked). Record how each was verified.
5. When finished: finalize progress.md, set status COMPLETE, and stop. Do not write the next kickoff or start the next milestone.
6. The next kickoff is generated separately from progress.md + docs/plan.md.
7. If a plan decision proves wrong, make the smallest workable choice, record it under Decisions with the reason, and flag it under Plan changes to consider.

## Project conventions
- Keep it simple: static output, no database, no CMS, zero client JS unless a kickoff justifies it.
- No analytics, cookies, third-party scripts, or remote font requests.
- Pure logic goes in `src/lib` or `scripts/lib` with Vitest tests.
- Site-wide text lives in `src/data/site.ts`.
- Follow the design rules in `docs/plan.md` §6 exactly: five colors, three fonts, lines and boxes only, no rounded corners, shadows, gradients, or emoji.
