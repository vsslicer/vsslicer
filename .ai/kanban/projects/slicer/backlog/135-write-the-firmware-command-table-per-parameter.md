---
id: 135
title: Write the firmware command table per parameter
type: feature
priority: P2
effort: M
model: sonnet
area: [calibration]
story: US48
milestone: "VSS:M5"
sprint: "VSS:SP38"
depends_on: [133]
created: 2026-10-25
---

Maps each calibratable parameter to the command of Klipper, Marlin, RRF and Bambu: `M104`/`M109`, `M221`, `SET_PRESSURE_ADVANCE`/`M900`/`M572`, retraction, `SET_INPUT_SHAPER`/`M593`, `SET_VELOCITY_LIMIT`/`M205`, speed.

**Code:** `vsslicer/modules/core/calibration/src/domain/...` (module: `calibration`, layer: `domain`)

## Acceptance criteria

- [ ] Each cell is a command template or an explicit "not available" with a reason; a test lists every parameter and firmware cell
- [ ] Commands are cross-checked against the Klipper, Marlin and RRF G-code documents named in the test as sources
- [ ] Input shaping on Bambu is "not available" with the reason text

## Tasks

- [ ] Collect command forms per firmware
- [ ] Write the table
- [ ] Test every cell

## Progress

Not started.
