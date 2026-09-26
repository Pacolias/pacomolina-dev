---
title: "Spotify ignores public: false"
description: "Spotify's Web API creates playlists as public even when you ask for a private one."
date: 2026-09-21
type: til
project: spotify-mcp
topics: [backend]
# Draft until Paco approves the wording.
draft: true
---

Spotify's Web API ignores `public: false` when creating a playlist — it comes out public anyway. It's a confirmed bug on Spotify's side, so spotify-mcp says so in the tool's own description instead of pretending it works.
