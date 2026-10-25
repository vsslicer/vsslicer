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

- [x] Constant-accel trapezoids, junction deviation from `square_corner_velocity`, centripetal cap, `minimum_cruise_ratio`, time-based lookahead flush, SET_VELOCITY_LIMIT and firmware retraction are implemented (`[gcode_arcs] resolution` moved to GCP-82)
- [x] `; ESTIMATOR_ADD_TIME` adds macro time on the planner side via `addTime` (file-to-planner path moved to GCP-83)
- [x] M201/M203/M205 do not change a Klipper result (test that fails if a limit leaks in)

## Tasks

- [x] Port toolhead lookahead
- [ ] Port arc segmentation (GCP-82)
- [x] Macro time (planner side)
- [x] Wire limits

## Progress

w-klipper (SP3): `vsslicer/modules/gcode-planner/src/domain/klipper.ts` (`klipperPlanner`,
`createKlipperPlanner(KlipperOptions)`), tests `test/klipper.test.ts`; lint, test, build green.
Done: trapezoids, square_corner_velocity JD, centripetal cap, minimum_cruise_ratio, lazy time-based
flush + full flush at G4/M400, SET_VELOCITY_LIMIT, M204 S / min(P,T), Z and extrude-only limits,
E junction (icv), firmware retraction G10/G11, Marlin limits ignored (tested).
Left: `[gcode_arcs] resolution` (parser tessellates by chord tolerance; needs a parser segment-length
option or planner re-segmentation), `; ESTIMATOR_ADD_TIME` and G4 P values reaching ParsedFile
(parser drops comments / G4 params). Notes: `.reference/notes/GCP-20-klipper-planner.md`.
