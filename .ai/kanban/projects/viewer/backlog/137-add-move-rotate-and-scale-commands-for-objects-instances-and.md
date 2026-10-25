---
id: 137
title: "Add move, rotate and scale commands for objects, instances and parts"
type: feature
priority: P1
effort: M
model: sonnet
area: [editor]
story: US42
milestone: "VSS:M4"
sprint: "VSS:SP26"
depends_on: [136, 102, 103]
created: 2026-10-25
---

Commands that change the transform of a selection by a delta or to a value, about a pivot, in world or local space; uniform and non-uniform scale.

**Code:** `vsslicer/modules/project-extension/src/application/commands/transform/` (module: `project-extension`, layer: `application`)

## Acceptance criteria

- [ ] Move, rotate and scale of an object, an instance and a part each invert exactly
- [ ] A scale of zero is rejected with a named error
- [ ] The written transform equals the one the Orca CLI reads (oracle card)
- [ ] Registered with the command generator of the undo property test

## Tasks

- [ ] Three commands
- [ ] Pivot and space handling
- [ ] Registration
- [ ] Tests

## Progress

Not started.
