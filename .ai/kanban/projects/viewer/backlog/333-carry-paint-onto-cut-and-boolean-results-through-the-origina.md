---
id: 333
title: Carry paint onto cut and boolean results through the originating face
type: feature
priority: P2
effort: M
model: opus
area: [mesh, painting]
story: US89
milestone: "VSS:M5"
sprint: "VSS:SP48"
depends_on: [324, 323, 291]
created: 2026-10-25
---

Gives each output triangle the paint state at its place on the input triangle it came from (the state at the centroid via `stateAt`), so supports, seams and colours follow the geometry through a cut or boolean.

**Code:** `vsslicer/modules/core/mesh-boolean/src/application/paint.ts` (module: `mesh-boolean`, layer: `application`)

## Acceptance criteria

- [ ] Cutting a painted fixture: the painted area of each state on the halves sums to the original within the resolution of one split level (measured and recorded)
- [ ] Cap faces and new boolean surfaces are unpainted
- [ ] A mesh with no paint costs nothing
- [ ] Output layers are valid for the output meshes (triangle counts match)

## Tasks

- [ ] Map output triangles
- [ ] Sample state
- [ ] Tests

## Progress

Not started.
