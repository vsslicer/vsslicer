---
id: 324
title: "Planar cut with capped faces: keep upper, lower or both"
type: feature
priority: P2
effort: M
model: sonnet
area: [mesh]
story: US87
milestone: "VSS:M5"
sprint: "VSS:SP31"
depends_on: [321, 322, 275]
created: 2026-10-25
---

`cut(mesh, plane, options)` returns the upper half, the lower half or both, each a closed mesh with a cap on the cut face, plus the cap triangle indices.

**Code:** `vsslicer/modules/mesh-boolean/src/application/cut.ts` (module: `mesh-boolean`, layer: `application`)

## Acceptance criteria

- [ ] The volumes of the halves sum to the original within 0.1 percent on every fixture and on random planes
- [ ] Both halves are closed manifold meshes (statistics); a plane that misses the mesh returns a no-intersection result without error
- [ ] Halves match Orca's recorded cut volumes within 0.5 percent
- [ ] A plane through a vertex or along a face does not fail

## Tasks

- [ ] Cut function
- [ ] Cap faces
- [ ] Volume tests
- [ ] Degenerate planes

## Progress

Not started.
