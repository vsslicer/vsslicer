---
id: 152
title: Generate the cornering (junction deviation) test
type: feature
priority: P2
effort: S
model: sonnet
area: [calibration]
story: US44
milestone: "VSS:M5"
sprint: "VSS:SP27"
depends_on: [147]
created: 2026-10-25
---

Tower sweeping `SET_VELOCITY_LIMIT SQUARE_CORNER_VELOCITY`, Marlin `M205 J`, or jerk per block; writes the printer's junction deviation or jerk key.

**Code:** `vsslicer/modules/calibration/src/domain/...` (module: `calibration`, layer: `domain`)

## Acceptance criteria

- [ ] The parser detects the intended parameter per block (fixtures only, D5)
- [ ] Firmware without the command refuses with a reason
- [ ] The target key is the flavour's key from the catalogue

## Tasks

- [ ] Mesh
- [ ] Plan
- [ ] Tests

## Progress

Not started.
