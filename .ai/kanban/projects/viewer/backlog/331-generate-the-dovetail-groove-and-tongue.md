---
id: 331
title: Generate the dovetail groove and tongue
type: feature
priority: P2
effort: M
model: opus
area: [mesh]
story: US88
milestone: "VSS:M5"
sprint: "VSS:SP46"
depends_on: [319]
created: 2026-10-25
---

Geometry of Bambu Studio's dovetail cut: a tongue on one half and a groove on the other along the cut face, with angle, depth, count and clearance. Behaviour matched to the Orca project in the fixtures; code ported where it follows `OrcaSlicer@09aa0114:src/libslic3r/CutUtils.cpp` and the connector types of `Model.hpp` (AGPL-3.0, D2).

**Code:** `vsslicer/modules/core/mesh-boolean/src/domain/connectors/dovetail.ts` (module: `mesh-boolean`, layer: `domain`)

## Acceptance criteria

- [ ] Tongue and groove differ only by the clearance on the fixtures
- [ ] The tongue is within the part's footprint on the cut face; a dovetail that does not fit is refused with the reason
- [ ] Both solids closed manifold

## Tasks

- [ ] Geometry
- [ ] Fit checks
- [ ] Tests

## Progress

Not started.
