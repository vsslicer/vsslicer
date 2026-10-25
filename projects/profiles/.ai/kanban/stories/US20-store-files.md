---
id: US20
title: "A user's profiles live as one JSON file each, indexed and watched"
status: reviewed
epic: VSS:E13
---

A user keeps edited profiles as files in the workspace (tracked by git, which replaces cloud sync); the store indexes them, notices outside edits and never loses an edit made from two windows.

## Acceptance criteria

- [ ] `get`, `list` and `query` work over the index; identity comes from `id`, not file names
- [ ] A file edited outside VSSlicer is re-indexed within one second; an invalid file gives a diagnostic and the last valid version stays resolvable
- [ ] Concurrent writes from two windows lose no edit (temp file and rename, compare `meta.updated`); unchanged files are never rewritten
- [ ] A crash between temp write and rename leaves the old file intact

## Out of scope

- Bundle formats (E18); secrets (E16).
