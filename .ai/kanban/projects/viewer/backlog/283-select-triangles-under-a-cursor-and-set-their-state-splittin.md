---
id: 283
title: "Select triangles under a cursor and set their state, splitting at the cursor edge"
type: feature
priority: P2
effort: M
model: opus
area: [mesh, painting]
story: US81
milestone: "VSS:M5"
sprint: "VSS:SP42"
depends_on: [278, 279, 280, 282]
created: 2026-10-25
---

`paintCursor(layer, mesh, candidates, cursor, state, options)` sets the state of the triangles inside the cursor, splitting the ones the cursor edge crosses down to a depth limit, and returns the new layer and a `PaintDelta`. Ported from `select_patch` and the cursor classes of `OrcaSlicer@09aa0114:src/libslic3r/TriangleSelector.cpp` and `.hpp` (AGPL-3.0, D2; cross-check `PrusaSlicer@30ef591:src/slic3r-domain/include/Slic3r/Domain/TriangleSelector.hpp`).

**Code:** `vsslicer/modules/mesh/src/application/paint/select.ts` (module: `mesh`, layer: `application`)

## Acceptance criteria

- [ ] A sphere stroke on a fixture selects the triangles whose leaf lies inside the radius; a leaf crossing the edge is split to the depth limit
- [ ] Painting the same state twice changes nothing (empty delta); painting none erases
- [ ] Support and seam enforcer/blocker and colour states all work through the one function
- [ ] Notice and `Ported from` line present

## Tasks

- [ ] Port patch selection
- [ ] Depth and precision options
- [ ] Delta output
- [ ] Tests

## Progress

Not started.
