---
id: 136
title: "Compute transforms: compose, mirror, scale about a pivot, unit factors and lay-flat rotation"
type: feature
priority: P1
effort: M
model: sonnet
area: [editor]
story: US42
milestone: "VSS:M4"
sprint: "VSS:SP26"
depends_on: [52]
created: 2026-10-25
---

Pure 4x4 helpers the commands share: compose and decompose, rotate and scale about a pivot, mirror matrices, unit factors and the rotation that turns a face normal to point down.

**Code:** `vsslicer/modules/project-extension/src/domain/transform/` (module: `project-extension`, layer: `domain`)

## Acceptance criteria

- [ ] Decompose then compose equals the matrix within 1e-9 for random transforms
- [ ] Mirror matrices have determinant -1; lay-flat of a given normal puts that normal at -Z
- [ ] Unit factors are 25.4 and 1000

## Tasks

- [ ] Matrix helpers
- [ ] Lay-flat rotation
- [ ] Property tests

## Progress

Not started.
