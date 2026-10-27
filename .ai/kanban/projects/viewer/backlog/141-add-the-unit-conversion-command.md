---
id: 141
title: Add the unit conversion command
type: feature
priority: P1
effort: S
model: sonnet
area: [editor]
story: US44
milestone: "VSS:M4"
sprint: "VSS:SP29"
depends_on: [136, 137]
created: 2026-10-25
---

Scales an object by an inch or metre factor so it reads as millimetres.

**Code:** `vsslicer/modules/apps/project/src/application/commands/transform/` (module: `project-extension`, layer: `application`)

## Acceptance criteria

- [ ] A 1 inch cube becomes 25.4 mm
- [ ] Undo restores the scale
- [ ] Registered with the command generator of the undo property test

## Tasks

- [ ] Command
- [ ] Tests

## Progress

Not started.
