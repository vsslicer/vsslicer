---
id: E4
title: Plan moves per firmware and estimate print time
status: reviewed
initiative: I1
project: GCP
order: 2
depends_on: [E5]
rows: ["§10 Firmware-aware time estimate"]
---

Firmware-aware motion planners in `@vsslicer/gcode` that give every move a start time and its
entry, cruise and exit speeds, so users see a trustworthy total time, time per layer and per
feature, and the preview (E5) can place the toolhead at any instant. Klipper, Marlin 2 / Prusa
Buddy and RRF get their own planner; Bambu gets a Marlin-model estimate labelled as such, because
its firmware is closed. The target is klipper_estimator's own bar: under 1 minute of error over
12 hours.

## Scope

In:
- **Klipper planner**: constant-accel trapezoids, junction deviation derived from
  `square_corner_velocity`, the centripetal cap, `minimum_cruise_ratio`, the time-based lookahead
  flush, `SET_VELOCITY_LIMIT`, `[gcode_arcs] resolution` segmentation, firmware retraction.
  M201/M203/M205 ignored. **Ported** from klipper@ee2c6fb `klippy/toolhead.py` and
  `klippy/extras/gcode_arcs.py` (GPL-3.0, combined under AGPL-3.0 per GPL-3.0 §13), with notices
  and provenance lines. `; ESTIMATOR_ADD_TIME` honoured for macro time.
- **Marlin 2 / Buddy planner**: 16-block reverse and forward pass, junction deviation or classic
  jerk, M201/M203/M204/M205, firmware arc segmentation with duration hints, linear-advance accel
  cap (it changes time). **Ported** from PrusaSlicer@30ef591 libpgcode `TimeMachine.cpp` and
  `TimeBlock.cpp` (AGPL-3.0, itself a Buddy port), checked against Marlin@2ef3ee6
  `src/module/planner.cpp` (GPL-3.0).
- **RRF planner**: per-axis instantaneous speed change from M566 (mm/min), M201/M203/M204.
  Written new from reprap.org documentation; RRF lookahead depth is an open question.
- **Bambu estimate**: the Marlin planner with jerk and accel from the profile and the file's
  M204/M205 lines; results carry `estimate: true` and the UI says so.
- **Limits**: a `MachineLimits` input resolved from, in order, an explicit override (setting or
  API), the file's config block (E3), then flavour defaults, with the source recorded. Live
  printer config (PRN) and profiles (E13) plug into the same input later.
- **Output**: f32 start time into E3's move buffer (sums kept in f64), per-layer and per-role
  time tables, and per-layer planner checkpoints so E5 can recompute trapezoids (entry, cruise,
  exit, accel) for any window on demand instead of storing them for every move.
- Runs in the parser's worker; cancellable; progress events.

Out: input shaping and Klipper pressure advance (they move the nozzle, not the clock), the true
nozzle-path overlay, delta and other non-Cartesian kinematics, Prusa phase stepping, rewriting
M73 lines into files (a possible later post-processor), porting klipper_estimator (oracle only).

## Feature-matrix rows

- **§10 Firmware-aware time estimate (P0).** Done when Klipper, Marlin/Buddy and RRF planners pass
  their oracles below, Bambu shows a labelled estimate, and per-layer times are exposed.

## Acceptance criteria

- [ ] Klipper: on the E3 corpus plus synthetic long files (12 h class), total time within 1 minute
      per 12 hours of klipper_estimator@dbcff4a output for the same `printer.cfg` JSON; CI runs
      klipper_estimator as a black-box oracle (built from its source in CI, not shipped)
- [ ] Marlin/Buddy: within 2 percent of PrusaSlicer's M73 normal-mode totals and per-layer M73
      progress on its own fixtures (tolerance confirmed or tightened after the first run and
      recorded as a decision)
- [ ] Unit tests for each planner rule with the regression it catches: junction at 90 and 180
      degrees, minimum cruise ratio on zig-zag, lookahead flush on a long straight, linear-advance
      cap, M566 conversion, arc segmentation count per firmware
- [ ] Klipper files ignore M201/M203/M205; a test fails if a limit from those lines leaks in
- [ ] Missing limits fall back to defaults and the result says "assumed limits" (test asserts
      the flag); unknown flavour uses Marlin and says so
- [ ] Bambu: three prints on the H2C (firmware version and date recorded) with measured duration
      compared to our estimate and Bambu Studio's; the error is recorded, not gated (closed
      firmware); everything else is verified on fixtures only
- [ ] Recomputing a window from a checkpoint gives the same start times as the full pass
      (property test over random windows)

## Dependencies

- Needs E5 (move buffers, config block, flavour detection).
- Exposes `plan(parsed, limits) -> Timing` (start times, layer and role tables, checkpoints,
  `estimate` flag, limit sources) and `trapezoidsFor(range)` to E7 and E51.
- Later inputs: E13 `ProfileStore.resolve` for limits, E23 Moonraker `configfile` for
  live Klipper limits. Neither is needed in I1.

## Risks and spikes

- Memory: storing entry, cruise and exit speeds per move adds about 12 bytes per move (180 MB at
  15M moves). Spike: checkpoint spacing versus recompute cost for a 1-second scrub window; pick
  the spacing and record it.
- RRF lookahead and arc segmentation are unverified (report open question): spike reading the
  RRF 3.6 source; until then RRF results are labelled lower confidence.
- Bambu motion model is unknown and M622/M623 conditional blocks may skip time at print time:
  measure on the H2C, treat blocks as executed, and record the error.
- klipper_estimator builds from Rust in CI; if that is too slow on free minutes, cache the binary
  or pin recorded oracle outputs with its commit hash.

## Eng review

- Scope: one row, but three planners and an estimate; 4 to 5 sprints. Splitting Klipper from
  Marlin was considered; both share the trapezoid, the timeline output and the test harness, so
  they stay together. RRF is the first thing to drop to a follow-up if the epic runs long.
- Explicit over clever: one planner interface, one implementation per firmware, no shared
  "configurable" planner that tries to be all of them.
- Changed after review: speeds are no longer stored per move (checkpoints instead); sums in f64.
- Zero silent failures: assumed limits, unknown flavour, invisible macros and closed firmware are
  each surfaced as flags on the result that E5 must show.
