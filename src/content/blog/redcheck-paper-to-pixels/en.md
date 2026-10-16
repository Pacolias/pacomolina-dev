---
title: "From paper to pixels"
description: "Ten days to turn a hand-drawn sketch into RedCheck's interface: what survived from the notebook, what moved, and the small details that make a planner feel calm."
date: 2026-03-30
type: article
project: redcheck
series:
  id: building-redcheck
  title: "Building RedCheck"
  part: 3
  arc: "The Beginnings"
topics: [frontend]
---

By 20 March RedCheck had a complete API and no interface at all
([part 2](/blog/redcheck-backend-first/)). On 21 March I created the
React project. Ten days later the dashboard had a calendar, a heatmap, a
focus mode and an AI button. This part is about those ten days.

A note on the screenshots: they aren't from back then. To get them, I
checked out the frontend exactly as it was on each date, ran it locally
and fed it sample data. What you see is the real code of that day, with
invented subjects and tasks.

## Day three: the notebook on a screen

React, TypeScript, Vite and Tailwind CSS. Login on day one, registration
on day two. On day three, 23 March, the first dashboard: a greeting, the
date, and the tasks grouped by subject, each with a checkbox and its
deadline.

![RedCheck's first dashboard: a white sidebar listing subjects with task counts and a progress circle, and a main area greeting the user with today's date and listing tasks grouped by subject, each with a checkbox, a deadline and "Edit task" and "Delete task" buttons.](./dashboard-march-23.webp "23 March 2026: the first dashboard. Recreated from that day's code, with sample data.")

It's plain, and it's very close to the sketch from
[part 1](/blog/redcheck-before-first-commit/), which was itself very close
to my notebook. All the HTTP calls lived in a small API layer from the
start, with an interceptor that attaches the JWT to every request. Since
the backend already existed and was documented, the frontend never had
to wait for an endpoint.

## What moved, and why

Over the following week the layout changed more than I expected, and the
sketch lost a few arguments with reality.

- **The calendar moved to the centre.** In the sketch it was a small
  month view tucked into the sidebar. Once each day showed how many tasks
  it held and how many were done, it was the most useful thing on the
  screen, and it deserved the space. The task list moved to a column on
  the right.
- **The sidebar became a dashboard of its own.** The progress circle
  stayed, and a "task balance" chart joined it: the three subjects with
  the most pending work, so you can see at a glance where to put the
  effort.
- **Overdue tasks got their own block.** In the notebook, an overdue
  task was simply copied to the next page, again and again. On screen, a
  task past its deadline moves to a separate "Out of time" section,
  still grouped by subject. It stays visible without polluting today's
  plan.
- **Dates became words.** Instead of `07/04/2026, 20:00`, a deadline
  reads "Today, 20:00" in red, "Tomorrow" in yellow or "The day after
  tomorrow" in green. Nobody should have to do date arithmetic to know
  what's urgent.

![RedCheck's dashboard on 7 April 2026: a sidebar with a progress circle, a task balance chart and SmartCheck AI cards, a central month calendar with past days in green showing completed over total tasks, and a right-hand column greeting the user and listing tasks by subject with coloured deadline labels.](./dashboard-april-7.webp "7 April 2026: the layout two weeks later. Recreated from that day's code, with sample data.")

## A heatmap for consistency

The notebook could tell me how today was going. It couldn't tell me how
the last month had gone. That was the second thing I wanted from an app,
and the reason the backend stores a progress snapshot for every day.

The interface turns each snapshot into a colour, inspired by GitHub's
contribution graph: a day with nothing planned stays blank, a day where
nothing got done gets a faint red, and from there it goes through three
greens as the completion rate passes 50 % and 80 %. The month calendar
uses the same scale, so a good week literally looks green.

Focus Mode hides the calendar entirely and puts the heatmap next to
today's tasks: just the list and your track record, nothing else.

![RedCheck's Focus Mode on 7 April 2026: the sidebar on the left, today's tasks grouped by subject in the centre, and on the right a "Your performance" panel with a GitHub-style heatmap of daily activity from January to April, mostly green in March.](./focus-mode-april-7.webp "Focus Mode: today's tasks and the heatmap, without the calendar. Recreated from the code of 7 April, with sample data.")

## Small decisions

- **No state library.** React's own hooks were enough: `useState` for
  the interface, plain state for what came from the server, and
  `useMemo` for derived data like today's tasks or the heatmap, so they
  only recompute when their inputs change. Redux or Zustand would have
  been one more thing to learn and maintain for no visible benefit at
  this size.
- **Components split late.** The dashboard started as one big file. On
  day four it split into `Sidebar`, `SubjectSection`, `TaskItem` and
  `OverdueSection`, once it was clear which pieces repeated. Splitting
  earlier would have meant guessing.
- **Motion, with a cost I didn't see yet.** On 27 March I added
  `framer-motion` for page transitions and small animations: a checkbox
  that pops, tasks that slide in and out. It made the app feel finished.
  It was also used in exactly one place, and its exit animations never
  actually ran. Removing it, months later, saved about 120 KB
  ([part 15](/blog/redcheck-native-feel/)).

## What I took from this stage

- A sketch is a hypothesis. The calendar moving to the centre wasn't a
  failure of the sketch, it was the first thing I learned by using the
  real thing.
- Having the API finished first paid off exactly as planned: ten days of
  pure interface work, with no backend detours.
- The details that make an app calm are cheap: words instead of dates,
  overdue tasks set aside instead of piled on top.

In the middle of those ten days, on 26 March, a new button appeared in
the sidebar: *Daily task analysis*. That's the next part.
