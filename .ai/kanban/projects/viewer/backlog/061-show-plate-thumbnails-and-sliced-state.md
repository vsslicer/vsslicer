---
id: 61
title: Show plate thumbnails and sliced state
type: feature
priority: P0
effort: M
model: sonnet
area: [plates]
story: US19
milestone: "VSS:M2"
sprint: "VSS:SP8"
depends_on: [59, 74]
created: 2026-10-25
---

Plate icons from `plate_N.png`, cover thumbnail, and sliced time and weight as the tree description.

**Code:** `vsslicer/modules/project-extension/src/presentation/tree/` (module: `project-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] Every plate of the Bambu, Orca and `.gcode.3mf` fixtures shows thumbnail, time and weight
- [ ] Missing thumbnail part shows a placeholder and a notice

## Tasks

- [ ] Thumbnail loading
- [ ] Description
- [ ] Tests

## Progress

Not started.
