---
id: 123
title: Implement the project folder on the Node file system
type: feature
priority: P1
effort: S
model: sonnet
area: [editor]
story: US39
milestone: "VSS:M4"
sprint: "VSS:SP27"
depends_on: [122]
created: 2026-10-25
---

The Node file-system side of `FolderStore`, with a test that PRN-shaped reads and writes of the reserved paths work.

**Code:** `vsslicer/modules/apps/project/src/adapters/folderStore.ts` (module: `project-extension`, layer: `adapters`)

## Acceptance criteria

- [ ] Creating, writing and reading in `sliced/`, `queue.json` and `history/` works on three OSes
- [ ] A read-only folder gives a named error

## Tasks

- [ ] Adapter
- [ ] Tests

## Progress

Not started.
