---
id: 280
title: Split across shared edges so neighbouring triangles stay consistent
type: feature
priority: P2
effort: M
model: opus
area: [mesh, painting]
story: US81
milestone: "VSS:M5"
sprint: "VSS:SP41"
depends_on: [279, 233]
created: 2026-10-25
---

When a stroke splits an edge, the triangle across that edge is split at the same point so no leaf has a split point its neighbour lacks. Ported from the neighbour handling of `OrcaSlicer@09aa0114:src/libslic3r/TriangleSelector.cpp` and `.hpp` (AGPL-3.0, D2; cross-check `PrusaSlicer@30ef591:src/slic3r-domain/include/Slic3r/Domain/TriangleSelector.hpp`), using the connectivity built by the repair steps.

**Code:** `vsslicer/modules/mesh/src/application/paint/neighbours.ts` (module: `mesh`, layer: `application`)

## Acceptance criteria

- [ ] After random strokes on the fixtures every shared edge has the same split points on both sides
- [ ] Leaf areas still sum to the mesh area; the codec round-trips the result
- [ ] A mesh with a non-manifold edge is painted without a crash (the edge is split on one side only and reported)
- [ ] Notice and `Ported from` line present

## Tasks

- [ ] Port neighbour splitting
- [ ] Edge-consistency check
- [ ] Property tests

## Progress

Not started.
