---
id: 276
title: "Define the paint types: kinds, states, the triangle tree and PaintLayer"
type: feature
priority: P2
effort: S
model: sonnet
area: [mesh, painting]
story: US80
milestone: "VSS:M5"
sprint: "VSS:SP29"
depends_on: [38]
created: 2026-10-25
---

The data the painting tools and the codec share: a `PaintLayer` per kind (support, seam, colour) holding a subdivision tree for each painted triangle.

**Code:** `vsslicer/modules/mesh/src/domain/paint/` (module: `mesh`, layer: `domain`)

## Acceptance criteria

- [ ] `PaintKind` support, seam and colour; support and seam states are none, enforcer, blocker; colour states are a filament index (0 for none)
- [ ] A tree node holds the split sides, the special side and its state or children, as in TriangleSelector
- [ ] `PaintLayer` holds the kind, the triangle count and a sparse map from triangle index to tree; an unpainted triangle has no entry
- [ ] No I/O in the folder (lint); type tests pass

## Tasks

- [ ] Types
- [ ] Constructors and equality
- [ ] Type tests

## Progress

Not started.
