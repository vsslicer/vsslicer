# Changelog

## 0.2.0

- GCP-20: Klipper planner, ported from klipper@ee2c6fb `klippy/toolhead.py`: `klipperPlanner` and `createKlipperPlanner(KlipperOptions)`. Constant-accel trapezoids, junction deviation from `square_corner_velocity`, centripetal cap, `minimum_cruise_ratio`, lazy time-based lookahead flush and a full flush at G4/M400, SET_VELOCITY_LIMIT, M204 S / min(P, T), Z and extrude-only limits, E junction, firmware retraction (G10/G11), macro time via `addTime`. M201/M203/M205 are ignored. Not yet: `[gcode_arcs] resolution` segmentation and `; ESTIMATOR_ADD_TIME` from the file.
- GCP-24: Marlin 2 and Prusa Buddy planners, ported from PrusaSlicer@30ef591 libpgcode and checked against Marlin@2ef3ee6 `planner.cpp`: `marlinPlanner`, `buddyPlanner`, `marlinFamilyPlanner(variant)`, `marlinArcSegments`, `buddyArcSegments`, `BLOCK_BUFFER_SIZE`. 16-block reverse and forward pass, junction deviation or classic jerk, M201/M203/M204/M205, firmware arc segmentation with duration hints, linear-advance accel cap; Buddy clamps M204 to the machine maxima. Marlin flavour defaults confirmed against Marlin@2ef3ee6 Configuration.h.
- Fix (GCP-19 review): limit precedence is defined per field as override > the file's own limit command > config block > flavour default. Both planners read limits through the new `MoveCursor.limit`, so a user override is no longer beaten by the file's M201/M203/M204/M205 (Marlin) or SET_VELOCITY_LIMIT/M204 (Klipper). The test harness checks it (`checkLimitPrecedence`) and that a planner yields at least once per move buffer. `sources` and `assumed` describe starting values only (documented).
- Depends on `@vsslicer/gcode-api` ^0.4.1.

## 0.1.0

- GCP-19: planner contract. `MachineLimits` with `resolveLimits` (override, config block, flavour defaults; per-field source, `assumed` and `flavourAssumed` flags), `Planner`, `Timing` (start times in the move buffer, f64 per-layer, per-role and travel tables, checkpoints), `runPlanner` (AbortSignal, progress) and `planSync`, `MoveCursor`, `TimingBuilder`, and `constantSpeedPlanner`.
