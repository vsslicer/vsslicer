---
id: 117
title: Check the extrude-only limit against klipper_estimator with the extruder limiter on
type: chore
priority: P2
effort: S
model: sonnet
milestone: "VSS:M2"
sprint: "VSS:SP10"
depends_on: [21]
created: 2026-10-26
---

Found reviewing GCP-21 (SP9): the recorded klipper_estimator outputs were made with `"move_checkers": []`, so the extruder limiter (`klipper_estimator@dbcff4a:lib/src/planner.rs:925-928,954-963`) was off, and the oracle test runs our planner with `maxExtrudeOnlyAccel: 1e9`. Our extrude-only limit (faithful to Klipper `klippy/kinematics/extruder.py:163-166,223`) is therefore not checked against the oracle. Q14 allowed one build; a re-record needs another local build.

**Code:** `vsslicer/modules/gcode-planner/test/fixtures/klipper-estimator/` (module: `gcode-planner`, layer: tests)

## Acceptance criteria

- [ ] Ask the owner on the board whether klipper_estimator may be rebuilt once more to re-record with `{"extruder_limiter": {...}}` in `move_checkers` (ratio as our planner uses); if yes, re-record the five outputs and drop the `maxExtrudeOnlyAccel` override from the test; if no, record the gap in PROVENANCE.md and close
- [ ] The bar stays 1 minute per 12 hours

## Progress

Not started.
