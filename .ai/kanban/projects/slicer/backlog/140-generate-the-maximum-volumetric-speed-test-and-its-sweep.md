---
id: 140
title: Generate the maximum volumetric speed test and its sweep
type: feature
priority: P2
effort: S
model: sonnet
area: [calibration]
story: US43
milestone: "VSS:M5"
sprint: "VSS:SP26"
depends_on: [133, 134, 135]
created: 2026-10-25
---

Single-wall tower whose feed rate ramps per layer; the picked layer gives the flow limit; target key `filament_max_volumetric_speed`.

**Code:** `vsslicer/modules/calibration/src/domain/...` (module: `calibration`, layer: `domain`)

## Acceptance criteria

- [ ] The sweep derives the flow per block from line width, layer height and speed; a unit test checks the arithmetic for three settings
- [ ] Blocks and layer ranges follow CAL4
- [ ] The mesh is manifold

## Tasks

- [ ] Mesh
- [ ] Flow arithmetic
- [ ] Plan
- [ ] Tests

## Progress

Not started.
