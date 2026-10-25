---
id: 352
title: Smooth a profile with a radius
type: feature
priority: P2
effort: M
model: opus
area: [mesh]
story: US91
milestone: "VSS:M5"
sprint: "VSS:SP46"
depends_on: [348, 274]
created: 2026-10-25
---

Smooths a profile over a radius and a number of passes while keeping the object height and the limits. Ported from `smooth_height_profile` in `OrcaSlicer@09aa0114:src/libslic3r/Slicing.cpp` (AGPL-3.0, D2; the functions behind `Slicing.hpp:166,179`; PrusaSlicer's `Slicing` as the cross-check).

**Code:** `vsslicer/modules/mesh/src/application/layerheight/smooth.ts` (module: `mesh`, layer: `application`)

## Acceptance criteria

- [ ] Smoothed profiles agree with the Orca profiles recorded in the fixtures within 0.01 mm per sample at both radii
- [ ] The result stays inside the printer limits and ends at the object height
- [ ] Notice and `Ported from` line present

## Tasks

- [ ] Port smoothing
- [ ] Compare with Orca

## Progress

Not started.
