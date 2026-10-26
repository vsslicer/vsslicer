---
id: 210
title: Compute no-fit polygons and candidate positions
type: feature
priority: P1
effort: M
model: opus
area: [arrange]
story: US61
milestone: "VSS:M4"
sprint: "VSS:SP30"
depends_on: [209, 206, 207]
created: 2026-10-25
---

Computes no-fit polygons between items and the bed region and the candidate positions for the next item. Ported from `OrcaSlicer@09aa0114:src/libslic3r/Arrange.cpp` and `ModelArrange.cpp` (AGPL-3.0) on `deps_src/libnest2d` (LGPL-3.0) (D2), with the notice and a `Ported from` line.

**Code:** `vsslicer/modules/arrange/src/application/nfp/` (module: `arrange`, layer: `application`)

## Acceptance criteria

- [ ] For two rectangles and for a rectangle and an L-shape the candidate positions equal hand-computed ones
- [ ] No candidate overlaps a placed item or leaves the region (property test)
- [ ] Notice and `Ported from` line present

## Tasks

- [ ] NFP computation
- [ ] Candidate set
- [ ] Property test

## Progress

Not started.
