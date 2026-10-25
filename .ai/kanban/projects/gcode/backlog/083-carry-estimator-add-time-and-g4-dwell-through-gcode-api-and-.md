---
id: 83
title: Carry ESTIMATOR_ADD_TIME and G4 dwell through gcode-api and the parser to the planners
type: feature
priority: P1
effort: L
model: opus
story: US7
milestone: "VSS:M1"
sprint: "VSS:SP4"
depends_on: [20]
created: 2026-10-25
---

Module: gcode-api (contract) then gcode-parser (adapter). Split from GCP-20 (SP3 review): `; ESTIMATOR_ADD_TIME <s>` comments and the `G4 P/S` dwell length do not reach the planner, because the parser drops comments and keeps G4 as a bare marker. The Klipper planner already accepts macro time via `KlipperOptions.addTime`.

## Acceptance criteria

- [ ] gcode-api carries a dwell/added-time value on the marker (contract change, minor version)
- [ ] gcode-parser fills it from `G4 P<ms>`/`G4 S<s>` and `; ESTIMATOR_ADD_TIME` (tests)
- [ ] The Klipper planner adds both; Marlin and RRF add G4 dwell (harness case)

## Progress

Not started.
