---
id: 138
title: Generate the temperature tower and its sweep
type: feature
priority: P2
effort: M
model: sonnet
area: [calibration]
story: US40
milestone: "VSS:M5"
sprint: "VSS:SP40"
depends_on: [133, 134, 135]
created: 2026-10-25
---

The first generator: tower geometry as an indexed mesh with one block per temperature, text labels omitted, plus the sweep and its write-back key `nozzle_temperature`.

**Code:** `vsslicer/modules/core/calibration/src/domain/...` (module: `calibration`, layer: `domain`)

## Acceptance criteria

- [ ] The mesh is manifold (edge-count check) and fits a 180 mm bed at default settings
- [ ] The plan has one block per temperature step with the layer range of each; the default range suits PLA, PETG and ABS presets
- [ ] The plan targets `nozzle_temperature` of the material

## Tasks

- [ ] Tower mesh
- [ ] Block table
- [ ] Plan builder
- [ ] Tests

## Progress

Not started.
