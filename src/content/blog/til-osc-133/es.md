---
title: "OSC 133 marca comandos"
description: "Las shells pueden emitir secuencias OSC 133 que marcan dónde empieza cada prompt, comando y salida."
date: 2026-09-22
type: til
project: shellmate
topics: [frontend]
# Draft until Paco approves the wording.
draft: true
---

Una terminal puede saber exactamente dónde empieza cada prompt, cada comando y su salida: las shells pueden emitir secuencias de escape **OSC 133** a su alrededor (y **OSC 7** para el directorio actual). ShellMate se apoya en ellas para seguir tu bash/zsh real sin tocar tu configuración.
