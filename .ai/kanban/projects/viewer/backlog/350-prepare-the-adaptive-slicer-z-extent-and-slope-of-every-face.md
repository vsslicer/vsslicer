---
id: 350
title: "Prepare the adaptive slicer: z extent and slope of every face"
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

The face data the adaptive profile needs, sorted by z, with the normal angle per face. Ported from `SlicingAdaptive::prepare` in `OrcaSlicer@09aa0114:src/libslic3r/Slicing.cpp` (AGPL-3.0, D2; the functions behind `Slicing.hpp:166,179`; PrusaSlicer's `Slicing` as the cross-check).

**Code:** `vsslicer/modules/mesh/src/application/layerheight/prepare.ts` (module: `mesh`, layer: `application`)

## Acceptance criteria

- [ ] Prepared data on the fixtures equals a brute-force computation of the z extent and slope per face
- [ ] A 5 M triangle mesh prepares in a bounded time and memory (recorded)
- [ ] Notice and `Ported from` line present

## Tasks

- [ ] Port prepare
- [ ] Brute-force test
- [ ] Timing

## Progress

Not started.
