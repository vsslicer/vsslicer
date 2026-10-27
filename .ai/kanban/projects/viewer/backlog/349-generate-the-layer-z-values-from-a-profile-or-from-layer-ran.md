---
id: 349
title: Generate the layer Z values from a profile or from layer ranges
type: feature
priority: P2
effort: M
model: opus
area: [mesh]
story: US91
milestone: "VSS:M5"
sprint: "VSS:SP47"
depends_on: [348]
created: 2026-10-25
---

Turns a profile into the list of layer tops, and a set of layer ranges (with their `layer_height` overrides) into a profile. Ported from `generate_object_layers` and `layer_height_profile_from_ranges` in `OrcaSlicer@09aa0114:src/libslic3r/Slicing.cpp` (AGPL-3.0, D2; the functions behind `Slicing.hpp:166,179`; PrusaSlicer's `Slicing` as the cross-check).

**Code:** `vsslicer/modules/core/mesh/src/domain/layerheight/layers.ts` (module: `mesh`, layer: `domain`)

## Acceptance criteria

- [ ] Layer tops for the fixtures' saved profiles equal the layer Z values recorded in the fixtures within 1e-6 mm
- [ ] The first layer height is honoured; the last layer ends at the object height
- [ ] A range set converts to the same profile Orca writes for the Orca range fixture
- [ ] Notice and `Ported from` line present

## Tasks

- [ ] Port layer generation
- [ ] Port ranges to profile
- [ ] Tests

## Progress

Not started.
