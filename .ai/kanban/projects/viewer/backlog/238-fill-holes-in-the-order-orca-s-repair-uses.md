---
id: 238
title: "Fill holes in the order Orca's repair uses"
type: feature
priority: P1
effort: M
model: opus
area: [mesh, repair]
story: US64
milestone: "VSS:M4"
sprint: "VSS:SP30"
depends_on: [230, 234]
created: 2026-10-25
---

Finds boundary loops and fills small holes by triangulation, in the step order and thresholds of Orca's cross-platform pipeline. Ported from `OrcaSlicer@09aa0114:src/libslic3r/MeshRepair.cpp` (AGPL-3.0, D2); the algorithms taken from CGAL are replaced by the route in the spike. Notice and `Ported from` line required.

**Code:** `vsslicer/modules/mesh/src/domain/repair/holes.ts` (module: `mesh`, layer: `domain`)

## Acceptance criteria

- [ ] Hole fixtures become closed with zero open edges
- [ ] A hole above the size threshold is left and reported, never half-filled
- [ ] Notice and `Ported from` line present

## Tasks

- [ ] Boundary loops
- [ ] Triangulation
- [ ] Threshold rules
- [ ] Tests

## Progress

Not started.
