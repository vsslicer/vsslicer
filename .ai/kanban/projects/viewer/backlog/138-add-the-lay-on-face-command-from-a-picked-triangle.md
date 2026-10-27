---
id: 138
title: Add the lay-on-face command from a picked triangle
type: feature
priority: P1
effort: S
model: sonnet
area: [editor]
story: US43
milestone: "VSS:M4"
sprint: "VSS:SP26"
depends_on: [137]
created: 2026-10-25
---

Takes an object and a triangle index, rotates the object so that face points down and drops it to the bed.

**Code:** `vsslicer/modules/apps/project/src/application/commands/transform/` (module: `project-extension`, layer: `application`)

## Acceptance criteria

- [ ] After the command the picked face normal is -Z and the lowest vertex is at z = 0
- [ ] Undo restores the transform exactly
- [ ] Registered with the command generator of the undo property test

## Tasks

- [ ] Command
- [ ] Tests

## Progress

Not started.
