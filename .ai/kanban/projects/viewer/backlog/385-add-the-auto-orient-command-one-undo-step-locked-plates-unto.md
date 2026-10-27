---
id: 385
title: "Add the auto-orient command: one undo step, locked plates untouched"
type: feature
priority: P2
effort: M
model: sonnet
area: [editor, plates]
story: US97
milestone: "VSS:M5"
sprint: "VSS:SP49"
depends_on: [101, 103, 137, 173, 171, 381]
created: 2026-10-25
---

Orients the selected objects or all objects of a plate through the mesh workers and applies the rotations as one undoable command. Objects on locked plates are skipped and listed in the result.

**Code:** `vsslicer/modules/apps/project/src/application/commands/orient/` (module: `project-extension`, layer: `application`)

## Acceptance criteria

- [ ] One run is one undo step; undo restores every rotation exactly
- [ ] Objects on locked plates are not touched and the result names them
- [ ] The plate invariants hold after a run (checked by the invariant test)
- [ ] Registered with the command generator of the undo property test

## Tasks

- [ ] Command
- [ ] Lock guard
- [ ] Worker call
- [ ] Generator registration
- [ ] Tests

## Progress

Not started.
