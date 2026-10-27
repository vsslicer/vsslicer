---
id: 413
title: Define the CurrentProject and LibraryEntry value objects
type: feature
priority: P0
effort: S
model: sonnet
area: [editor]
story: US99
milestone: "VSS:M3"
sprint: "VSS:SP14"
created: 2026-10-27
---

The pure model behind "one project per window" (D23): what a project is, how it is identified, and how two references compare.

**Code:** `vsslicer/modules/apps/project/src/domain/current-project.ts`, `.../domain/library-entry.ts` (module: `project-extension`, layer: `domain`)

## Acceptance criteria

- [ ] `ProjectRef` is `{ kind: '3mf' | 'folder', uri: string, name: string }`: a `.3mf` file, or a project folder (a directory holding a `.vsslicer/` folder or at least one `.3mf` at its top level); the name is the file name without `.3mf` or the folder name
- [ ] `LibraryEntry` adds `lastOpened?: string` (ISO time); `sortRecent` orders entries by `lastOpened` descending, then name, and keeps a cap of N recent entries
- [ ] Equality is by normalised URI (trailing slash, case on case-insensitive file systems passed in as a flag, never read from the OS here)
- [ ] Unit tests in plain Node; no `vscode` or `node:fs` import (the layer lint fails otherwise)

## Tasks

- [ ] Types and constructors with validation
- [ ] Recent ordering
- [ ] Unit tests

## Progress

Not started.
