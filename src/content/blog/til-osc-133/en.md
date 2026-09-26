---
title: "OSC 133 marks commands"
description: "Shells can emit OSC 133 escape sequences that mark where each prompt, command and output begins."
date: 2026-09-22
type: til
project: shellmate
topics: [frontend]
# Draft until Paco approves the wording.
draft: true
---

A terminal can know exactly where each prompt, command and its output begin: shells can emit **OSC 133** escape sequences around them (and **OSC 7** for the current directory). ShellMate relies on them to follow your real bash/zsh without touching your shell config.
