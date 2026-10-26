---
id: 376
title: Compute the convex hull of a mesh
type: feature
priority: P2
effort: S
model: sonnet
area: [mesh]
story: US97
milestone: "VSS:M5"
sprint: "VSS:SP48"
depends_on: [38]
created: 2026-10-25
---

The convex hull as an indexed mesh, used to generate candidate orientations; uses an installed quickhull library rather than new code.

**Code:** `vsslicer/modules/mesh/src/application/hull.ts` (module: `mesh`, layer: `application`)

## Acceptance criteria

- [ ] Hull volume of the cube and sphere fixtures is correct (cube exactly, sphere within 0.5 percent of the tessellated sphere)
- [ ] A flat plate (zero thickness hull) returns a typed degenerate result

## Tasks

- [ ] Wrapper
- [ ] Tests

## Progress

Not started.
