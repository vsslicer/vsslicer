---
id: 336
title: Add the cut command
type: feature
priority: P2
effort: M
model: sonnet
area: [editor, mesh]
story: US87
milestone: "VSS:M5"
sprint: "VSS:SP31"
depends_on: [101, 103, 135, 142, 144, 327]
created: 2026-10-25
---

Cuts an object at a plane into parts of the same object or into separate objects, keeping upper, lower or both, as one undoable command. Results go through the mesh repair check.

**Code:** `vsslicer/modules/project-extension/src/application/commands/cut/` (module: `project-extension`, layer: `application`)

## Acceptance criteria

- [ ] Cut to objects and cut to parts both give closed manifold meshes whose volumes sum to the original within 0.1 percent
- [ ] Undo restores the original object exactly; plate membership is restored
- [ ] Cutting an object on a locked plate is refused with the reason
- [ ] Registered with the command generator of the undo property test

## Tasks

- [ ] Command
- [ ] To parts and to objects
- [ ] Generator registration
- [ ] Tests

## Progress

Not started.
