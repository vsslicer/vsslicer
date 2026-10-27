---
id: 417
title: Read the library folder from the Node file system
type: feature
priority: P0
effort: S
model: sonnet
area: [editor]
story: US99
milestone: "VSS:M3"
sprint: "VSS:SP14"
depends_on: [416]
created: 2026-10-27
---

The second side of the `LibraryFolder` port: `node:fs/promises` over a real directory.

**Code:** `vsslicer/modules/apps/project/src/adapters/node-library-folder.ts` (module: `project-extension`, layer: `adapters`)

## Acceptance criteria

- [ ] `readDir` and `mkdir` on `node:fs/promises`; symlinks are not followed; a permission error on one sub-folder is reported and the rest of the scan continues
- [ ] A test on a temporary directory (`mkdtemp`) with a `.3mf`, a project folder, a dot-folder and an unreadable folder gives the same result as the in-memory port test

## Tasks

- [ ] Adapter
- [ ] Test

## Progress

Not started.
