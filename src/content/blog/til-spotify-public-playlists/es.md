---
title: "Spotify ignora public: false"
description: "La API web de Spotify crea las playlists como públicas aunque pidas una privada."
date: 2026-09-21
type: til
project: spotify-mcp
topics: [backend]
---

La API web de Spotify ignora `public: false` al crear una playlist — sale pública igualmente. Es un bug confirmado de Spotify, así que spotify-mcp lo avisa en la propia descripción de la tool en lugar de fingir que funciona.
