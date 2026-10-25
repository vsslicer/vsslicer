---
id: 149
title: Port the PA line and pattern path generators from OrcaSlicer
type: feature
priority: P2
effort: L
model: opus
area: [calibration]
story: US42
milestone: "VSS:M5"
sprint: "VSS:SP37"
depends_on: [147]
created: 2026-10-25
---

Generates the extrusion paths of the PA line and PA pattern tests (the E-dependent lines and the corner pattern), ported from `OrcaSlicer@09aa0114:src/libslic3r/calib.cpp` and the path code in `GCode.cpp` (AGPL-3.0, D2).

**Code:** `vsslicer/modules/calibration/src/domain/...` (module: `calibration`, layer: `domain`)

## Acceptance criteria

- [ ] Files carry the AGPL notice and a `Ported from OrcaSlicer@09aa0114:src/libslic3r/calib.cpp` line; the licence check (PLT-11) passes
- [ ] The generated paths equal Orca's own output for the same parameters on a recorded reference (segment endpoints within 0.01 mm)
- [ ] The parser detects the PA value per line group for each firmware
- [ ] Paths respect the bed size and the printer's extrusion width

## Tasks

- [ ] Read the upstream code
- [ ] Port the line generator
- [ ] Port the pattern generator
- [ ] Compare with the recording

## Progress

Not started.
