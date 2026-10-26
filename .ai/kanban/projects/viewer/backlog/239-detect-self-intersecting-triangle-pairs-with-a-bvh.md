---
id: 239
title: Detect self-intersecting triangle pairs with a BVH
type: feature
priority: P1
effort: M
model: sonnet
area: [mesh, repair]
story: US64
milestone: "VSS:M4"
sprint: "VSS:SP31"
depends_on: [230, 46, 229]
created: 2026-10-25
---

Finds pairs of triangles that intersect other than along shared edges, using the BVH, as input to the removal.

**Code:** `vsslicer/modules/mesh/src/domain/repair/` (module: `mesh`, layer: `domain`)

## Acceptance criteria

- [ ] The self-intersection fixture reports the known pair count
- [ ] A clean mesh reports none
- [ ] 10,000 random cube pairs agree with brute force

## Tasks

- [ ] Pair search
- [ ] Brute-force comparison

## Progress

Not started.
