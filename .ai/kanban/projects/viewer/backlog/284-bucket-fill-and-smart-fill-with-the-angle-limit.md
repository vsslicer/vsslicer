---
id: 284
title: Bucket fill and smart fill with the angle limit
type: feature
priority: P2
effort: M
model: opus
area: [mesh, painting]
story: US82
milestone: "VSS:M5"
sprint: "VSS:SP42"
depends_on: [283, 273]
created: 2026-10-25
---

Bucket fill paints the connected region of one state; smart fill stops at edges sharper than an angle. Ported from the seed-fill functions of `OrcaSlicer@09aa0114:src/libslic3r/TriangleSelector.cpp` and `.hpp` (AGPL-3.0, D2; cross-check `PrusaSlicer@30ef591:src/slic3r-domain/include/Slic3r/Domain/TriangleSelector.hpp`).

**Code:** `vsslicer/modules/mesh/src/application/paint/fill.ts` (module: `mesh`, layer: `application`)

## Acceptance criteria

- [ ] Bucket and smart fill select the same triangle sets as the Orca results recorded in the fixtures (three fills)
- [ ] A fill never crosses a state boundary; the smart-fill angle limit is respected on a cube and a rounded block
- [ ] Fills on a 100 k triangle fixture finish and return a delta
- [ ] Notice and `Ported from` line present

## Tasks

- [ ] Port seed fill
- [ ] Smart fill angle
- [ ] Compare with recorded results
- [ ] Tests

## Progress

Not started.
