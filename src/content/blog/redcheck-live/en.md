---
title: "RedCheck goes live"
description: "Deploying RedCheck on its own domain — Docker, a server from scratch, async LLM calls, and one small UX detail."
date: 2026-06-02
type: linkedin
linkedin: https://www.linkedin.com/feed/update/urn:li:activity:7467504912843702272/
project: redcheck
topics: [backend, devops, ai]
images:
  - src: ./dashboard.webp
    alt: "RedCheck's dashboard: the month calendar coloured by workload, task balance per subject, and the task list grouped by subject."
  - src: ./focus-mode.webp
    alt: "RedCheck's Focus Mode: today's tasks with their deadline labels, and the activity heatmap on the side."
---

There is a huge gap between code working on localhost and a live application in production. Over the weekend, I decided to cross that line and deployed RedCheck on its own domain: [redcheck.es](https://redcheckapp.com/). 🚀

It started as a standard task manager, but I wanted to take it a step further by integrating SmartCheck AI to analyze workload. Bringing this to production was a solid technical challenge:

- ⚙️ **The backend & deployment:** getting the app out of my local environment meant containerizing with Docker, setting up the server from scratch, and handling the infrastructure.
- 🧠 **AI token optimization:** honestly, the hardest part wasn't the AI itself, but designing the backend architecture to handle asynchronous LLM requests and optimize token usage without burning through resources.
- 🎨 **A nod to UX:** I'm definitely more of a backend guy, but I believe in reducing cognitive load. Instead of raw dates, deadlines show up as "Today" (pastel red), "Tomorrow" (pastel yellow), or "The day after tomorrow" (pastel green). A tiny frontend detail, but it saves the user from having to calculate days.

Feel free to play around with it, test the AI, or try to break the server! Feedback on the architecture or performance is super welcome. 🏗️

*Update: RedCheck now lives at [redcheckapp.com](https://redcheckapp.com/) — the old redcheck.es address redirects there.*
