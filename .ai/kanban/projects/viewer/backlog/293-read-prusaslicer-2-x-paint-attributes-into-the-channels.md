---
id: 293
title: Read PrusaSlicer 2.x paint attributes into the channels
type: feature
priority: P2
effort: S
model: sonnet
area: [3mf, painting]
story: US84
milestone: "VSS:M5"
sprint: "VSS:SP46"
depends_on: [25, 292, 273]
created: 2026-10-25
---

Reads `slic3rpe:custom_supports`, `slic3rpe:custom_seam` and `slic3rpe:mmu_segmentation` from `<triangle>` as raw strings, with the attribute names as in PrusaSlicer's `3mf.cpp` (path under `PrusaSlicer@30ef591` recorded in the notice).

**Code:** `vsslicer/modules/core/3mf/src/adapters/prusa/triangleAttributes.ts` (module: `3mf`, layer: `adapters`)

## Acceptance criteria

- [ ] The Prusa 2.9 fixture yields the channel strings equal to the strings recorded in the fixtures
- [ ] Triangles without the attributes yield empty strings; a file with no paint is unchanged
- [ ] Notice and `Ported from` line present

## Tasks

- [ ] Read attributes
- [ ] Golden

## Progress

Not started.
