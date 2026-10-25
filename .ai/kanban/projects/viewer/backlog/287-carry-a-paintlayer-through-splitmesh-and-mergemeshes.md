---
id: 287
title: Carry a PaintLayer through splitMesh and mergeMeshes
type: feature
priority: P2
effort: S
model: sonnet
area: [mesh, painting]
story: US84
milestone: "VSS:M5"
sprint: "VSS:SP41"
depends_on: [276, 130, 131]
created: 2026-10-25
---

Split to objects or parts and merge keep the paint with the triangles: the new meshes get the matching trees, and merge concatenates layers with an index offset.

**Code:** `vsslicer/modules/mesh/src/application/paint/splitMerge.ts` (module: `mesh`, layer: `application`)

## Acceptance criteria

- [ ] Split then merge returns a layer equal to the start (as a set of per-triangle trees)
- [ ] A component's layer holds exactly the trees of its triangles
- [ ] Layers of different kinds stay separate

## Tasks

- [ ] Split
- [ ] Merge
- [ ] Tests

## Progress

Not started.
