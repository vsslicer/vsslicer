---
id: 383
title: Scale to a measured length through the scale command
type: feature
priority: P2
effort: S
model: sonnet
area: [editor]
story: US96
milestone: "VSS:M5"
sprint: "VSS:SP48"
depends_on: [137, 101, 103]
created: 2026-10-25
---

Given a measured length and a target, computes the factor and runs the existing scale command about the object's pivot, uniform or along the measured axis.

**Code:** `vsslicer/modules/project-extension/src/application/commands/transform/scaleToLength.ts` (module: `project-extension`, layer: `application`)

## Acceptance criteria

- [ ] A 20 mm cube measured on an edge and scaled to 25 mm measures 25 mm within 0.01 mm
- [ ] Execute then undo restores the transform; the command is the existing scale command, not a new one
- [ ] A zero or negative target is refused
- [ ] Registered with the command generator of the undo property test

## Tasks

- [ ] Factor
- [ ] Command wrapper
- [ ] Generator registration
- [ ] Tests

## Progress

Not started.
