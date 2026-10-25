---
id: 20
title: Port the Klipper planner
type: feature
priority: P0
effort: L
model: opus
area: [planner]
story: US7
milestone: "VSS:M1"
sprint: "VSS:SP3"
depends_on: [19]
created: 2026-10-25
---

Ported from klipper@ee2c6fb `klippy/toolhead.py` and `klippy/extras/gcode_arcs.py` (GPL-3.0 combined under AGPL-3.0 per D2, notices and provenance lines).

## Acceptance criteria

- [ ] Constant-accel trapezoids, junction deviation from `square_corner_velocity`, centripetal cap, `minimum_cruise_ratio`, time-based lookahead flush, SET_VELOCITY_LIMIT, `[gcode_arcs] resolution` segmentation and firmware retraction are implemented
- [ ] `; ESTIMATOR_ADD_TIME` adds macro time
- [ ] M201/M203/M205 do not change a Klipper result (test that fails if a limit leaks in)

## Tasks

- [ ] Port toolhead lookahead
- [ ] Port arc segmentation
- [ ] Macro time
- [ ] Wire limits

## Progress

Not started.
