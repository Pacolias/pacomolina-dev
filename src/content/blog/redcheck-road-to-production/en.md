---
title: "The road to production"
description: "Tests written after the fact, Docker images that built by skipping the type checker, and the weekend RedCheck went from my laptop to a real server."
date: 2026-06-01
type: article
project: redcheck
series:
  id: building-redcheck
  title: "Building RedCheck"
  part: 5
  arc: "The Beginnings"
topics: [backend, devops]
---

By the start of April RedCheck did everything I'd set out to build: the
notebook's daily list, recurring tasks, a heatmap, a calendar and an AI
that planned your day ([part 4](/blog/redcheck-smartcheck-v1/)). It ran
on one machine, mine. This last part of the beginnings is about what it
took to make it run anywhere else.

## Tests, after the fact

I'll be honest about the order: the tests came after the code. The
whole suite went in on a single day, 31 March, once the backend had
stopped changing shape.

- **Service tests with Mockito.** Repositories are replaced by mocks, so
  the business logic runs without a database: the recurring-task
  scheduler deciding whether to generate a task, the daily progress
  snapshot, the ownership checks.
- **Controller tests with MockMvc.** Full HTTP requests against the API,
  checking status codes, the JSON that comes back and that the JWT
  filter lets the right requests through.
- **JaCoCo** to measure what all of that actually covered.

![JaCoCo coverage report for the service package: TaskService 80%, RecurringTaskService 86%, SubjectService 84%, ProgressRecordService 98% and several services at 100%, while SmartCheckAIService, GeminiService and OllamaService are at 0%. Total: 66% of instructions.](./jacoco-services.webp "Service coverage. The three AI services are at 0 %.")

![JaCoCo coverage report for the controller package: every controller at 100% except SmartCheckAIController at 0%. Total: 88% of instructions.](./jacoco-controllers.webp "Controller coverage: 88 %, with the AI controller untested.")

The reports tell the truth, and the truth has a red stripe: everything
AI-related sat at 0 %. It was the newest code, the least stable, and the
hardest to test, because its output comes from a model. I knew that and
moved on. It's also, in hindsight, exactly where the worst bug in
RedCheck's history was hiding: the RAG pipeline that never wrote anything
([part 11](/blog/redcheck-smartcheck-engine/)).

Writing tests after the fact still paid off in a way I didn't expect.
Testing every endpoint one by one made me look at each of them, and two
turned out to be unused: fetching a single task or a single recurring
task by id. The frontend never called them, so they were deleted the same
day. Less code, less to secure.

## Containers

On 6 and 7 April both halves got a Dockerfile. The backend's builds the
Spring Boot application into an image. The frontend's builds the React
app with Node and then serves the static files with Nginx. Two images,
each runnable anywhere with Docker.

One commit from those days deserves a mention. Its message says
*simplify build script*. What it actually did was change `tsc -b && vite
build` to just `vite build`: the production build stopped running the
TypeScript compiler, because it was failing (six errors, I checked) and
the image wouldn't build. It worked, in the sense that the image built. It also
meant type errors could pile up unnoticed, and they did: when I reviewed
the code before going open source, the frontend had 11 TypeScript errors
([part 10](/blog/redcheck-open-source/)). Skipping a check that fails
doesn't fix anything. It just moves the bill.

## Learning to deploy

Then I put the project down for a while. When I picked it up again at
the end of May, it was with a different question. Deploying RedCheck had
never been part of the plan: the app was finished as far as I was
concerned. But I'd never put a real application on the internet myself,
and I wanted to know how that actually works.

That weekend, 30 May to 1 June, was a crash course:

- **Configuration out of the code.** Database credentials and other
  values that had been hardcoded for local development moved to
  environment variables. On a laptop, hardcoding is convenient. On a
  server, it's a leak waiting to happen.
- **CORS, properly.** The allowed origins became a setting instead of a
  development shortcut. What I didn't notice was that every controller
  still carried its own `@CrossOrigin("*")` from day one. That one
  survived until the open-source review months later.
- **A demo instead of sign-ups.** I wasn't ready to handle real users'
  data, so registration was switched off and replaced by a demo account,
  created automatically at startup, and a one-click "quick demo access"
  button on the login screen. The demo account can't be deleted, so the
  first visitor can't ruin it for the next.
- **One origin.** Until then the frontend called the backend directly at
  `localhost:8080`. In production, Nginx started forwarding API requests
  to the backend, so the browser only ever talks to one domain.
- **HTTPS, and two broken features.** After switching to HTTPS, the
  heatmap and the AI stopped working while everything else was fine. The
  cause was in that new Nginx config: instead of forwarding everything
  under one API prefix, it listed each backend path by name, and
  `/progress` and `/ai` weren't on the list. Two one-line fixes, and a lesson about
  configuration that has to be kept in sync with the code by hand.

## What I took from the beginnings

Looking back at these five parts:

- A habit made a better spec than any requirements document I could have
  written from scratch.
- Building the backend first was the right call for one person. The
  interface took ten days because the API never made it wait.
- The shortcuts were never free. The 0 % coverage on the AI, the skipped
  type checker and the forgotten `@CrossOrigin("*")` all came back,
  months later, as work.
- Deploying something teaches you things building it never will.

On 2 June 2026 RedCheck went live on its own domain. That's where the
next stage of this series begins: [RedCheck goes
live](/blog/redcheck-live/), the first part of *Out in the Wild*.
