---
# Entry number. Assigned by `npm run new`; must be unique.
no: 4
title: "Nobody reads the ticket"
# One or two sentences shown on the home page.
dek: "We write acceptance criteria like they are contracts, and then everyone builds from the Slack thread anyway."
# essay | note | rant
type: essay
# Set to today by `npm run publish` (or kept with --keep-date).
date: 2026-11-14
# Optional. Set to YYYY-MM-DD when you change a published post.
revised:
# Lowercase slugs, e.g. [process, code-review].
tags: [process, requirements]
# Optional. Uncomment to show it in the post's meta column.
confidence: "Opinion, lightly held"
draft: false
#
# Writing reminders. Comments up here never render.
#   Sidenote:    a claim.[^1]   ...then anywhere below:   [^1]: The note.
#   Highlighter: <mark>the one line that matters</mark>   (once per post at most)
#   Code title:  ```md title="TICKET-4127.md"
---


Every team I've worked on has a ticket template. Background, acceptance criteria, out of scope, a link to the designs. We review it in refinement, we point it, we drag it into the sprint.[^points] And then, about forty minutes into actually building the thing, somebody posts a question in Slack and the real requirements start showing up.

I used to think that was a failure. The ticket was supposed to be the source of truth, and the thread was drift. Now I'm not so sure. <mark>The ticket is where we write down what we think we want. The thread is where we find out.</mark>

## Where the requirements actually live

If you went back after any feature shipped and traced every decision to where it was made, you would end up with a messy map: half in the ticket, a quarter in a thread, a few in a hallway conversation, and one important one that only exists in a code comment.[^dana]

```md title="TICKET-4127.md" note="As written" {3}
## Acceptance criteria
- User can export the report as CSV
- Export matches what's on screen
- Works for large reports
```

"Matches what's on screen" did a lot of work in that ticket. Filters? Column order? The timezone the dates are rendered in? None of it was in the ticket. All of it was in the thread, eventually.

[The rest of the post continues here. This is sample copy to show rhythm, sidenotes, code, and a highlight; your real writing goes in a Markdown file.]

The thread isn't the problem. A thread is just the place where people who have to make a decision right now go to make it. The problem is that nobody carries the answer back. The ticket stays frozen at the moment of refinement, and six months later it's the only record anyone can find.

So the next person reads the ticket, believes it, and builds the wrong thing with total confidence. Or they read the code, find the one comment, and start asking around for someone who left two years ago.

None of this needs a new tool. It needs one habit: when the thread decides something, somebody pastes the decision back into the ticket, in one line, with a link. It's boring. It's the only fix I've seen survive more than a sprint.

[^points]: Points are a unit of mood. Fight me.
[^dana]: “// don’t remove this, ask Dana” — Dana left in 2023.
