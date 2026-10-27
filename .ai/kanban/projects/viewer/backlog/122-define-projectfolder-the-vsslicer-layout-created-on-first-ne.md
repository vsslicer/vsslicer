---
id: 122
title: "Define ProjectFolder: the .vsslicer layout created on first need"
type: feature
priority: P1
effort: M
model: sonnet
area: [editor]
story: US39
milestone: "VSS:M4"
sprint: "VSS:SP27"
depends_on: [101]
created: 2026-10-25
---

The `.vsslicer/` folder beside the 3MF with `sliced/`, reserved `queue.json` and `history/`, a README line and the recommended `.gitignore` entry, created lazily through a `FolderStore` port.

**Code:** `vsslicer/modules/apps/project/src/application/projectFolder.ts` (module: `project-extension`, layer: `application`)

## Acceptance criteria

- [ ] Nothing is created until something needs it
- [ ] The documented layout appears on first need; reserved paths are not created
- [ ] `ProjectModel.folder` returns the URIs for sliced, queue and history

## Tasks

- [ ] Layout
- [ ] FolderStore port
- [ ] Tests

## Progress

Not started.
