---
title: "The roadmap, revisited"
description: "At the start of the summer I wrote down four next steps for RedCheck. Four months later, three of them shipped, none of them the way I planned, and the fourth is closer than it looks."
date: 2026-10-16
type: article
project: redcheck
series:
  id: building-redcheck
  title: "Building RedCheck"
  part: 16
  arc: "Out in the Wild"
topics: [frontend, backend, ai]
---

At the start of the summer, with RedCheck freshly live
([part 6](/blog/redcheck-live/)), I wrote down what would come next. Four
lines, each with a one-sentence description:

1. **A native mobile app**: iOS and Android clients reusing the REST API.
2. **Push notifications**: alerts for tasks about to be due.
3. **Cron expressions**: an engine for complex, custom recurrence
   patterns.
4. **Preventive AI**: predicting bottlenecks from the history of daily
   performance.

It's October. Looking back at that list is more interesting than I
expected, because almost everything on it happened, and almost nothing
happened the way it was written.

| Planned in June | What actually happened |
|---|---|
| Native iOS and Android apps | An installable web app with native gestures |
| Push notifications | Reminders while the app is open |
| Arbitrary cron expressions | A deliberately restricted cron, plus one case by hand |
| Preventive AI from the heatmap | Not built yet, but its data now exists |

## A native app became a web app that feels native

The plan assumed that "mobile" meant native. The REST API was already
separate from the interface, so a native client seemed like the natural
next step: same backend, new frontend.

What changed my mind was counting the cost. Two native apps means two
more codebases, two app store reviews, and every release waiting on
someone else's approval. A progressive web app is one codebase, deployed
the moment I push, and installable from the browser.

So that's what RedCheck became ([part 15](/blog/redcheck-native-feel/)):
a web app manifest, home-screen shortcuts, an icon badge with your
pending tasks, bottom sheets, swipe to complete or delete, long-press to
select. The trade-off is reach versus capability: it runs everywhere,
but some things native apps get for free are harder. Which leads to the
second line.

![RedCheck on a phone in dark mode: the task list grouped by subject, with the bottom tab bar.](./mobile-tasks.webp "Tasks, with the bottom tab bar.")
![The sidebar drawer open over the task list: today's progress ring, the task balance per subject, and links to Trash, My routines, Settings and Log out.](./mobile-drawer.webp "The drawer, opened with an edge swipe.")
![Settings as a bottom sheet with a drag handle, over the dimmed task list.](./mobile-settings.webp "Settings as a bottom sheet.")
![The month calendar on a phone, each day coloured by how much was completed.](./mobile-calendar.webp "The month calendar.")

## Push notifications became reminders

"Alerts for tasks about to be due" sounds like one feature. It's really
two. Showing a notification while the app is open is easy. Reaching you
when it's closed needs a service worker, VAPID keys and a backend that
decides when to send each message and to whom.

I shipped the first half and labelled it honestly: while RedCheck is
open, in a tab or installed, it checks every minute for tasks due in the
next 30 minutes and shows a notification. Real push is still a project
of its own. There's also an option that didn't exist in June: since the
password-reset work ([part 13](/blog/redcheck-password-reset/)), RedCheck
can send email reliably, and an email reminder doesn't need a service
worker at all.

## Cron became a restricted cron

The plan said "complex, custom patterns". Cron can express almost
anything, so storing arbitrary cron expressions looked like the obvious
engine.

When I actually built custom routines
([part 14](/blog/redcheck-calendar/)), the problem wasn't expressing the
patterns, it was editing them. Nobody wants to type `0 0 0 * * MON,THU`.
A routine has to be editable through checkboxes, and if the database can
hold any cron expression, some of them can never be turned back into
checkboxes. So RedCheck stores cron, but only one exact shape of it,
validated on the way in: specific weekdays. The flexible version would
have been easier to build and impossible to use.

And one pattern doesn't use cron at all. "The last day of the month" has
no operator in Spring's cron implementation, and the naive "day 31" rule
silently skips seven months a year. That case is handled by hand.

![The "My routines" view: active routines, best streak and average completion at the top, and each routine with its frequency and next occurrence.](./routines.webp "Routines as they shipped: weekdays and days of the month, all editable as checkboxes.")

## Preventive AI is still coming, and closer than it looks

The fourth line hasn't shipped. The *Risk analysis* card in the sidebar
still says "Coming soon", as it has since the first version of SmartCheck
([part 4](/blog/redcheck-smartcheck-v1/)).

But the plan got one thing wrong, and finding out why moved it forward.
It said the AI would predict bottlenecks from the history of daily
performance: the heatmap. The heatmap is the wrong data. Each day is
stored as a single snapshot, a percentage, and that number has forgotten
which tasks were late, which subjects they belonged to and by how much
([part 2](/blog/redcheck-backend-first/)). You can see that a week was
bad. You can't see why.

The right data appeared almost by accident. When SmartCheck moved into
its own service and I found that its memory had never been written
([part 11](/blog/redcheck-smartcheck-engine/)), the fix was to record the
outcome of every task. Today the engine keeps, for each subject, the
completion rate, the average delay in days and how often you follow the
order the AI suggested. That's exactly what a preventive warning needs:
"your tasks in this subject usually finish two days late, and three of
them are due this week". The card is still a placeholder. The hard part
under it no longer is.

## What I took from this

- A roadmap names destinations. Constraints choose the route. Three of
  four lines shipped, and every one of them turned into something smaller,
  more specific and more usable than the sentence that described it.
- "Native app", "push notifications" and "cron" were descriptions of
  solutions, not problems. The problems were: feel at home on a phone,
  don't let deadlines sneak up, support real routines. Solving those led
  somewhere else.
- The item that didn't ship was blocked by having the wrong data, not by
  a lack of time. The right data showed up while I was fixing something
  else entirely.

I'll write the next list now, knowing it will age the same way.
