---
id: 278
title: "Record a stroke as the changed subtrees and apply, invert and clear it"
type: feature
priority: P2
effort: M
model: sonnet
area: [mesh, painting]
story: US81
milestone: "VSS:M5"
sprint: "VSS:SP41"
depends_on: [276]
created: 2026-10-25
---

A `PaintDelta` holds only the triangle subtrees a stroke changed, before and after. Applying it, inverting it and clearing a whole layer all use it, so a stroke command stays small.

**Code:** `vsslicer/modules/mesh/src/application/paint/delta.ts` (module: `mesh`, layer: `application`)

## Acceptance criteria

- [ ] `apply(layer, delta)` then `apply(layer, invert(delta))` gives a layer equal to the start on random deltas
- [ ] Two consecutive deltas compose into one that gives the same result
- [ ] `clearLayer` returns a delta that empties the layer and inverts exactly
- [ ] The delta size is proportional to the changed triangles, not the mesh (asserted on the 100 k fixture)

## Tasks

- [ ] Delta type and apply
- [ ] Invert and compose
- [ ] Clear
- [ ] Property tests

## Progress

Not started.
