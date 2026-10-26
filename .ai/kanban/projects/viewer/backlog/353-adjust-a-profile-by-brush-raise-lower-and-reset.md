---
id: 353
title: "Adjust a profile by brush: raise, lower, and reset"
type: feature
priority: P2
effort: M
model: opus
area: [mesh]
story: US92
milestone: "VSS:M5"
sprint: "VSS:SP47"
depends_on: [348]
created: 2026-10-25
---

Raises or lowers the profile around a z with a radius and a strength, clamped to the limits, and resets to the base layer height. Ported from `adjust_layer_height_profile` and `reset_layer_height_profile` in `OrcaSlicer@09aa0114:src/libslic3r/Slicing.cpp` (AGPL-3.0, D2; the functions behind `Slicing.hpp:166,179`; PrusaSlicer's `Slicing` as the cross-check).

**Code:** `vsslicer/modules/mesh/src/application/layerheight/adjust.ts` (module: `mesh`, layer: `application`)

## Acceptance criteria

- [ ] A brush at z with radius r changes samples only within r and by at most the strength per step
- [ ] Raising to the limit clamps; lowering below the minimum clamps
- [ ] Reset gives the constant base profile
- [ ] Notice and `Ported from` line present

## Tasks

- [ ] Port adjust
- [ ] Port reset
- [ ] Tests

## Progress

Not started.
