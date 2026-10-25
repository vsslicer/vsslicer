---
id: 378
title: "Score a candidate: overhang, bottom area and the weights"
type: feature
priority: P2
effort: M
model: opus
area: [mesh]
story: US97
milestone: "VSS:M5"
sprint: "VSS:SP47"
depends_on: [377]
created: 2026-10-25
---

The target function that ranks candidates, with the overhang and bottom-area weights. Ported from the scoring of `OrcaSlicer@09aa0114:src/libslic3r/Orient.cpp` (AGPL-3.0, D2; overhang and bottom-area weights at `Orient.hpp:34,60`).

**Code:** `vsslicer/modules/mesh/src/application/orient/score.ts` (module: `mesh`, layer: `application`)

## Acceptance criteria

- [ ] The ranking of the candidates on each fixture puts Orca's chosen rotation first or tied within Orca's tie tolerance
- [ ] Weights are options with Orca's defaults
- [ ] Notice and `Ported from` line present

## Tasks

- [ ] Port the scorer
- [ ] Compare with Orca
- [ ] Tests

## Progress

Not started.
