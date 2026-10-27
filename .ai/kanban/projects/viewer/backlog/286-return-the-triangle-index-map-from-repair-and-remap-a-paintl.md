---
id: 286
title: Return the triangle index map from repair and remap a PaintLayer through it
type: feature
priority: P2
effort: S
model: sonnet
area: [mesh, painting, repair]
story: US84
milestone: "VSS:M5"
sprint: "VSS:SP44"
depends_on: [276, 234, 241]
created: 2026-10-25
---

Repair removes degenerate and duplicate faces, which shifts triangle indices and would move paint onto the wrong triangles. Adds an additive `triangleMap` to the repair report and a function that remaps a `PaintLayer` through it.

**Code:** `vsslicer/modules/core/mesh/src/application/paint/remap.ts` (module: `mesh`, layer: `application`)

## Acceptance criteria

- [ ] `repairOnLoad` and `repair` reports carry `triangleMap` (old index to new index or removed); existing report goldens only gain the field
- [ ] On a fixture with removed faces the remapped layer paints the same geometry (leaf areas by state unchanged)
- [ ] Paint on a removed triangle is dropped and counted in the result

## Tasks

- [ ] Report field
- [ ] Remap
- [ ] Tests

## Progress

Not started.
