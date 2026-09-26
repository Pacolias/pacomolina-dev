---
title: "Opt in to transitions early"
description: "Chrome can skip cross-page view transitions on slow phones if the opt-in CSS arrives late."
date: 2026-09-26
type: til
topics: [frontend]
# Draft until Paco approves the wording.
draft: true
---

Chrome can silently skip a cross-page view transition on a slow phone if the `@view-transition` opt-in arrives late. On this site, moving it from the bundled stylesheet to an inline `<style>` at the top of `<head>` took it from working about half the time to every time.
