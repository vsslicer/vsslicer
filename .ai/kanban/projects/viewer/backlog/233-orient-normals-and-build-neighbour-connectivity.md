---
id: 233
title: Orient normals and build neighbour connectivity
type: feature
priority: P1
effort: M
model: sonnet
area: [mesh, repair]
story: US63
milestone: "VSS:M4"
sprint: "VSS:SP31"
depends_on: [231, 232, 44]
created: 2026-10-25
---

Makes face winding consistent across connected faces and builds the neighbour structure the later steps use. Ported from `OrcaSlicer@09aa0114:deps_src/admesh/*` (GPL-2.0-or-later, combinable with AGPL under GPL-3.0 section 13) (D2), with the notice and a `Ported from` line.

**Code:** `vsslicer/modules/core/mesh/src/domain/repair/` (module: `mesh`, layer: `domain`)

## Acceptance criteria

- [ ] The flipped-normal fixture ends with outward normals (positive volume) and the flipped count matches admesh
- [ ] Connectivity gives zero unmatched edges on closed fixtures
- [ ] Notice and `Ported from` line present

## Tasks

- [ ] Winding propagation
- [ ] Neighbours
- [ ] Tests

## Progress

Not started.
