---
id: 116
title: Close the 7.3 s Klipper planner gap on zig-zag infill against klipper_estimator
type: bug
priority: P1
effort: M
model: opus
milestone: "VSS:M2"
sprint: "VSS:SP9"
depends_on: [21]
created: 2026-10-26
---

Found by GCP-21 (SP9): on `orca-cube-marlin` our Klipper planner estimates 1018.56 s against klipper_estimator@dbcff4a's 1011.26 s (+7.3 s, 0.7 %, bar 1.4 s). Simple cases agree; the gap grows along the 45-degree zig-zag infill after `M204 S500`. Ruled out: minimum cruise ratio, max Z accel, extrude-only accel. See GCP-21's Progress and `vsslicer/modules/gcode-planner/test/klipper-oracle.test.ts`.

**Code:** `vsslicer/modules/gcode-planner/src/` (module: `gcode-planner`, layer: `domain`)

## Acceptance criteria

- [x] The cause is found by comparing per-move times with klipper_estimator's planner (`.reference/repos/klipper_estimator` `lib/src/planner.rs`, quote the lines) and Klipper's `toolhead.py` lookahead (`.reference/repos/klipper`), and fixed in our planner
- [ ] The `it.fails` on orca-cube-marlin in `klipper-oracle.test.ts` becomes a passing `it`, with the bar unchanged; the other four cases still pass
- [x] **Bounds:** no new per-move work beyond O(1) amortised; the existing linearity tests still pass

## Progress

sp9-gcp-116: cause found; the planner is NOT changed, and the `it.fails` stays (owner call, see below).

Measurement (scratch copy of the module with timers in `setJunction`, deleted afterwards): on orca-cube-marlin ours is accel 248.33 s / cruise 513.60 s / decel 248.29 s, against the oracle's recorded 248.31 / 513.56 / 248.28; Z-move time 35.88 s against 35.80 s. The whole gap is **extrude-only time: ours 16.93 s, oracle 9.1457 s** (`total_extrude_only_time` in `recorded/orca-cube-marlin.json`). The zig-zag junctions, M204 S, smoothed lookahead and short moves are not the cause; they agree.

Cause: Klipper gives every move the minimum_cruise_ratio pseudo-accel, extrude-only moves included: `self.mcr_delta_v2 = 2.0 * move_d * toolhead.mcr_pseudo_accel` (klipper@ee2c6fb:klippy/toolhead.py:51; extrude-only setup at :26-38). An extrude-only move has `max_mcr_start_v2 = 0`, so the flush's `peak_cruise_v2 = (mcr_start_v2 + reach_mcr_start_v2) * .5` (toolhead.py:163) caps its cruise at v^2 = |e| x accel x (1 - mcr). After `M204 S500` with mcr 0.5, a 0.9 mm retract at F2700 cruises at 15 mm/s, not 45. klipper_estimator instead gives extrude-only moves `acceleration: f64::MAX`, `max_dv2: f64::MAX`, `smoothed_dv2: f64::MAX` (klipper_estimator@dbcff4a:lib/src/planner.rs:357-363), so its retracts run at the commanded speed. Its extruder_limiter does not change that either: `limit_speed` sets `smoothed_dv2 = min(smoothed_dv2, max_dv2)` from the extruder accel (planner.rs:472-479, 954-963), never from accel_to_decel. So re-recording with the limiter (GCP-117) will not close this.

Check: with `mcrDeltaV2: kinematic ? 2 * moveD * th.mcrPseudoAccel : Infinity` in the scratch copy, ours is 1010.78 s against 1011.26 s (-0.48 s, inside the 1.4 s bar) and extrude-only time is 9.1459 s against 9.1457 s.

Why no fix in the planner: our Klipper planner follows Klipper (toolhead.py:51), and Klipper is what it estimates. Making it match the oracle would make it wrong for real printers, and every retract after a low M204 would be estimated too fast. The fix would be the one line above. Choices for the owner: (a) keep the planner as is and accept that orca-cube-marlin stays `it.fails` as a documented oracle divergence (my recommendation; maybe move it into its own "known divergence" case that asserts the gap is the extrude-only time); (b) add a `KlipperOptions` switch that only the oracle test sets; (c) make the planner match the estimator (not recommended).

Changed: `vsslicer/modules/gcode-planner/test/klipper-oracle.test.ts` comment on the `it.fails` now names the cause with both source lines. No source change.
Verified: `pnpm test` 100 passed + 1 expected fail (101), `pnpm lint` clean. `node scripts/run.mjs checks` fails only on `modules/profile-catalogue-data/package.json` (package-license), which is not in my files.
Not done: the `it.fails` is not flipped (criterion 2 open, waiting on the choice above). Bounds: no per-move work added. No shared-file lines.

**Coordinator (sp9-coordinator), 2026-10-26:** option (a) taken. The gap is not a planner bug: Klipper applies the minimum_cruise_ratio pseudo-accel to extrude-only moves (`klipper@ee2c6fb:klippy/toolhead.py:51,163`) and klipper_estimator does not (`klipper_estimator@dbcff4a:lib/src/planner.rs:357-363`). Our planner estimates Klipper, so it stays; the `it.fails` on orca-cube-marlin stays with its cause in the comment, and criterion 2 is dropped by this decision. GCP-117 is re-scoped by this finding (re-recording with the extruder limiter would not close this gap). The change in this card is a test comment only, checked by the coordinator (`git diff`), so no separate review round. Moved to done.
