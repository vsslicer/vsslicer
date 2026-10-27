---
id: 285
title: Gap fill and height-range fill
type: feature
priority: P2
effort: M
model: sonnet
area: [mesh, painting]
story: US82
milestone: "VSS:M5"
sprint: "VSS:SP42"
depends_on: [284]
created: 2026-10-25
---

Gap fill paints narrow regions that a bucket fill left (a triangle area threshold, as Orca's gap fill does); height-range fill paints everything between two Z values, splitting triangles at the band edges. Ported where it follows `OrcaSlicer@09aa0114:src/libslic3r/TriangleSelector.cpp` and `.hpp` (AGPL-3.0, D2; cross-check `PrusaSlicer@30ef591:src/slic3r-domain/include/Slic3r/Domain/TriangleSelector.hpp`).

**Code:** `vsslicer/modules/core/mesh/src/application/paint/gapAndHeight.ts` (module: `mesh`, layer: `application`)

## Acceptance criteria

- [ ] Gap fill result equals Orca's recorded result on the fixture
- [ ] A height range paints all and only the leaves between z0 and z1 (edge triangles split exactly at the plane, areas sum)
- [ ] Both return a delta and invert exactly

## Tasks

- [ ] Gap fill
- [ ] Height fill
- [ ] Tests

## Progress

Not started.
