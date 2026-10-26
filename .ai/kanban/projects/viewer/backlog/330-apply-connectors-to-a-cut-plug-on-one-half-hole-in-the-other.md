---
id: 330
title: "Apply connectors to a cut: plug on one half, hole in the other"
type: feature
priority: P2
effort: M
model: opus
area: [mesh]
story: US88
milestone: "VSS:M5"
sprint: "VSS:SP46"
depends_on: [324, 328, 329]
created: 2026-10-25
---

After the planar cut, adds each plug to one half and subtracts its hole from the other at the placed positions. Ported from the connector processing of `OrcaSlicer@09aa0114:src/libslic3r/CutUtils.cpp` and the connector types of `Model.hpp` (AGPL-3.0, D2).

**Code:** `vsslicer/modules/mesh-boolean/src/application/connectors.ts` (module: `mesh-boolean`, layer: `application`)

## Acceptance criteria

- [ ] Both halves stay closed manifold; plug and hole positions coincide on the cut face within 0.01 mm
- [ ] The part volume changes by the connector volumes (within 0.5 percent)
- [ ] Placement outside the cut face is refused with the reason
- [ ] Notice and `Ported from` line present

## Tasks

- [ ] Port connector processing
- [ ] Placement check
- [ ] Tests

## Progress

Not started.
