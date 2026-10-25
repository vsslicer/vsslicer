---
id: 135
title: Add the add and remove commands for objects and volumes
type: feature
priority: P1
effort: M
model: sonnet
area: [editor]
story: US46
milestone: "VSS:M4"
depends_on: [102, 103]
created: 2026-10-25
---

Commands that add or remove an object or a volume with its mesh, name and transform. They are the primitives that split, merge, volumes and STEP import use.

**Code:** `vsslicer/modules/project-extension/src/application/commands/structure/` (module: `project-extension`, layer: `application`)

## Acceptance criteria

- [ ] Add then undo removes it and restores indices; remove then undo restores it at the same index with its plate membership
- [ ] Mesh data is referenced, not copied, in the history
- [ ] Registered with the command generator of the undo property test

## Tasks

- [ ] Four commands
- [ ] Registration
- [ ] Tests

## Progress

Not started.
