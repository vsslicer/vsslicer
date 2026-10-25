---
id: 279
title: "Port the subdivision core: split types, children and merging equal children"
type: feature
priority: P2
effort: M
model: opus
area: [mesh, painting]
story: US81
milestone: "VSS:M5"
sprint: "VSS:SP29"
depends_on: [276, 277]
created: 2026-10-25
---

Splits one painted triangle into 2, 3 or 4 children along its sides, merges children that all hold the same state, and answers the state at a barycentric point. Ported from `split_triangle`, `perform_split` and `remove_useless_children` in `OrcaSlicer@09aa0114:src/libslic3r/TriangleSelector.cpp` and `.hpp` (AGPL-3.0, D2; cross-check `PrusaSlicer@30ef591:src/slic3r-domain/include/Slic3r/Domain/TriangleSelector.hpp`).

**Code:** `vsslicer/modules/mesh/src/domain/paint/subdivide/` (module: `mesh`, layer: `domain`)

## Acceptance criteria

- [ ] Leaf triangle areas of any split tree sum to the parent area within 1e-9
- [ ] Children that all share a state collapse into the parent; the codec output of the collapsed tree equals the fixture string
- [ ] `stateAt(triangle, barycentric)` returns the leaf state; the cut tools use it to carry paint
- [ ] Notice and `Ported from` line present

## Tasks

- [ ] Port split types
- [ ] Merge
- [ ] stateAt
- [ ] Property tests

## Progress

Not started.
