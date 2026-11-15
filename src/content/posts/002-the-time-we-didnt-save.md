---
# Entry number. Assigned by `npm run new`; must be unique.
no: 2
title: "The time we didn’t save"
# One or two sentences shown on the home page.
dek: "We rarely make time to work out what a ticket means, and then we’re surprised by the rework and the tired team."
# essay | note | rant
type: rant
# Set to today by `npm run publish` (or kept with --keep-date).
date: 2026-11-15
# Optional. Set to YYYY-MM-DD when you change a published post.
revised:
# Lowercase slugs, e.g. [process, code-review].
tags: [requirements, process]
# Optional. Uncomment to show it in the post's meta column.
confidence: "Sure of the problem. Less sure we’ll make the time."
draft: true
#
# Writing reminders. Comments up here never render.
#   Sidenote:    a claim.[^1]   ...then anywhere below:   [^1]: The note.
#   Highlighter: <mark>the one line that matters</mark>   (once per post at most)
#   Code title:  ```md title="TICKET-4127.md"
---

You pick up a ticket. It has a title, "Update user permissions," and nothing else. No description, no acceptance criteria, no link to anything. It was created six months ago.

So you ask. The person who created it remembers the meeting but not the details.[^memory] Someone thinks it was about admins. Someone else thinks it came from a customer request, maybe two. Nobody is being difficult. Nobody knows, because nobody ever wrote it down, and the ticket has been in the backlog long enough to look like it means something.

Then it gets pulled into the sprint anyway, because it has a title and it has points, and that's usually enough.

## The trade nobody makes on purpose

I don't think any team decides to skip requirements. It happens one reasonable shortcut at a time. Planning runs long, so the last few tickets get a title and a promise to fill them in later. A date is close, so we agree to figure it out as we go. Writing down what done looks like feels like paperwork when there's real work waiting.[^expected]

Part of the problem is that the cost is invisible when you pay it. A deadline is on a calendar. An hour spent working out what a ticket means isn't on anything. It's also nobody's job in particular, which in practice means it's nobody's job.

And asking questions can feel like slowing everyone down. When the room is ready to move on, being the person who says "wait, what does done look like?" takes a bit of nerve.

## Where the time goes

<mark>Skipping requirements doesn't save the time. It moves it to later, where it costs more and nobody can see where it came from.</mark>

Mostly it comes back as rework. We build what the title suggested, demo it, and find out it was the wrong thing, or the right thing for a different person. Then we build it again. The second version is usually better, but we paid for two.

It also comes back as the quick question in a thread halfway through the sprint that turns into a redesign, and as an estimate that was an honest estimate of the work as described, when the work as described was a title. A few weeks later someone asks in the retro why it took so long, and the honest answer, "we found out what it was while we were building it," sounds like an excuse.

The part that doesn't show up on any board is what this does to people. Building the same thing twice is tiring in a way that's hard to explain. So is being asked why something is late when the delay started before you picked it up. After enough of that, people stop asking questions, stop pushing back, and start quietly padding every estimate. That isn't a morale problem a team lunch will fix. It's the requirements problem again, arriving later.

## Our part

Developers aren't bystanders in this. We get a vague ticket and start coding, because coding feels like progress and asking questions feels like stalling. We build the happy path first because it's the only path anyone described, and we meet the other paths in QA, or in production.

We also tend to treat missing requirements as someone else's job. Sometimes it is. But we're the first ones to find out something is missing, and we're usually in the best position to ask.

## What helps

None of this needs a new process or a new tool. What I've seen work is smaller than that.

**Ask early.** On day one, not in week two. Before the branch exists, read the ticket and ask the questions it doesn't answer, then put the answers in the ticket. Being the person with awkward questions in planning is a lot cheaper than being the person explaining the rework in the retro.

**Make time for it in planning.** If nobody can explain a ticket, it isn't ready, and working out what it means is real work. Give it time: a refinement slot, a short spike, or a ticket of its own. We already accept that code review is part of the work. Requirements belong in the same category.

A few questions do most of it. Here is the same ticket before and after someone asked them:

```md title="TICKET.md" note="Before and after" {12-13}
## Before
Title: Update user permissions
Description: (none)
Created: six months ago

## After asking
Title: Update user permissions
For: admins who manage their team's access
Done when: an admin can remove someone's access
  without deleting their account
Out of scope: new roles
When it goes wrong: removing the last admin is blocked,
  with a message that says why
```

None of those answers took a design document. Most of them took one conversation with the right person. The last one is the question this blog is named after.

## The half hour

I'm not asking for perfect specs, or a month of documents before anyone writes code. Most of the time, half an hour of questions would cover it. I'm asking for that half hour to count as work, and to be planned like work.

Otherwise we'll keep saving it, and spending the week it costs us somewhere nobody's looking.

[^memory]: Which is fair. It was six months ago, and they've been in a lot of meetings since.
[^expected]: "Works as expected" is not an answer to "done when." Expected by whom?
