---
id: 240
title: Remove self-intersections by the route the spike chose
type: feature
priority: P1
effort: L
model: opus
area: [mesh, repair]
story: US64
milestone: "VSS:M4"
sprint: "VSS:SP22"
depends_on: [239, 238]
created: 2026-10-25
---

Resolves the detected intersections following the step order of Orca's `MeshRepair.cpp` (AGPL-3.0, D2) with the route from the spike. Written as a TypeScript implementation by default; if the spike picks WASM the card is re-pointed to an adapter and says so.

**Code:** `vsslicer/modules/mesh/src/domain/repair/selfIntersections.ts` (module: `mesh`, layer: `domain`)

## Acceptance criteria

- [ ] The self-intersection fixtures end with zero intersecting pairs and a closed manifold result
- [ ] Volume differs from Orca's result by less than 0.5 percent
- [ ] An unresolvable case is reported and the mesh left unchanged
- [ ] Notice and `Ported from` line present

## Tasks

- [ ] Resolution algorithm
- [ ] Failure handling
- [ ] Tests

## Progress

Not started.
