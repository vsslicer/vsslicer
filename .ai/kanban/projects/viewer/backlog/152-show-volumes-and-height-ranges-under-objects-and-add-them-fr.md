---
id: 152
title: Show volumes and height ranges under objects and add them from the context menu
type: feature
priority: P1
effort: M
model: sonnet
area: [editor]
story: US46
milestone: "VSS:M4"
sprint: "VSS:SP19"
depends_on: [59, 145, 150]
created: 2026-10-25
---

Extends the project tree with volume and range nodes, their type icons and menu actions to add, retype and remove.

**Code:** `vsslicer/modules/project-extension/src/presentation/tree/` (module: `project-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] Volumes show their kind; ranges show from to
- [ ] Menu actions call the commands and the tree updates from change events
- [ ] Selecting a node selects it in the 3D view

## Tasks

- [ ] Tree nodes
- [ ] Menu
- [ ] Test host test

## Progress

Not started.
