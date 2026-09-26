---
title: "RedCheck's recycle bin"
description: "Soft deletes and a recycle bin for RedCheck — and why a 'just add a column' feature ended up touching half the architecture."
date: 2026-08-21
type: linkedin
linkedin: https://www.linkedin.com/feed/update/urn:li:activity:7496618991306821632/
project: redcheck
series:
  id: building-redcheck
  title: "Building RedCheck"
  part: 3
topics: [backend, frontend]
images:
  - src: ./empty-bin.webp
    alt: "RedCheck's recycle bin, empty: a friendly empty state saying deleted items will show up here."
  - src: ./bin-with-items.webp
    alt: "RedCheck's recycle bin with a deleted subject and three deleted tasks, each with restore and delete-forever actions, and an 'Empty bin' button."
---

Deleted something by mistake? No worries, RedCheck now has a Recycle Bin. 🗑️

Accidental deletions are incredibly common and a surefire way to ruin the UX. That's why the latest feature I've been working on is a complete soft-delete and recycle bin system.

On paper, it sounds like just adding a new column to the database and calling it a day. But implementing this robustly broke our initial entity contracts, which meant some deep refactoring:

**🛠️ Backend & database**

- Migrated the data model to include soft-delete flags (`deleted`).
- Refactored queries and endpoints to ensure deleted items don't pollute the main views.
- Updated stored procedures and MySQL events so the new entity constraints wouldn't break background automation.

**🎨 Frontend**

- Designed a dedicated view with smooth transition animations so restoring or permanently deleting tasks feels fluid.
- Created friendly empty states and global actions like "Empty trash".

What's the main takeaway from this iteration? No feature, no matter how trivial it seems, is ever just a quick fix. Simply modifying the base entity contracts forced a rethink of a large part of the architecture just to keep the database consistent and the frontend spotless.

Feel free to check it out at [redcheck.es](https://redcheckapp.com/)! Any feedback or suggestions for improvement are more than welcome.
