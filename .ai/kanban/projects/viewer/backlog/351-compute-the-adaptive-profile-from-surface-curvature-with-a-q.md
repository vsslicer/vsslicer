---
id: 351
title: Compute the adaptive profile from surface curvature with a quality value
type: feature
priority: P2
effort: M
model: opus
area: [mesh]
story: US91
milestone: "VSS:M5"
sprint: "VSS:SP48"
depends_on: [350, 349, 274]
created: 2026-10-25
---

`adaptiveProfile(mesh, limits, quality)` gives the layer height at each z from the steepest surface in the layer (the cusp height rule). Ported from `layer_height_profile_adaptive` and `SlicingAdaptive::next_layer_height` in `OrcaSlicer@09aa0114:src/libslic3r/Slicing.cpp` (AGPL-3.0, D2; the functions behind `Slicing.hpp:166,179`; PrusaSlicer's `Slicing` as the cross-check).

**Code:** `vsslicer/modules/core/mesh/src/application/layerheight/adaptive.ts` (module: `mesh`, layer: `application`)

## Acceptance criteria

- [ ] Profiles agree with the Orca profiles recorded in the fixtures within 0.01 mm per sample at both quality values for all three meshes
- [ ] Heights stay within the printer's min and max; a vertical wall gets the maximum, a flat top the minimum
- [ ] Notice and `Ported from` line present

## Tasks

- [ ] Port adaptive
- [ ] Compare with Orca
- [ ] Limits tests

## Progress

Not started.
