# Changelog

## Unreleased

- GCP-21: oracle test against recorded klipper_estimator@dbcff4a outputs (Q14); GCP-116: the orca-cube-marlin divergence (extrude-only pseudo-accel) is documented.

## 0.5.0

- GCP-108: `ToolheadWindow.toTransfer()` and `ToolheadWindow.fromTransfer()` (exact round trip), and the `@vsslicer/gcode-planner/window` entry, which does not load the planners.
- GCP-99: `Flavour` and `flavourFromName` come from gcode-api 0.7.0 (depends on ^0.7.0) and are still re-exported; no behaviour change.

## 0.4.0

- Depends on gcode-api ^0.6.0.
- GCP-89: Cura `;FLAVOR:` names: `RepRap` ("RepRap (RepRap)", for Duet) selects the RepRapFirmware planner; `Griffin`, `Cheetah`, `Marlin(Volumetric)` and `RepRap (Volumetric)` the Marlin planner without the assumed flag (CuraEngine@47b0388); `UltiGCode` stays assumed.
- GCP-92: `createKlipperPlanner` throws RangeError unless `checkpointInterval` is a positive integer.
- GCP-93: a G4 dwell in a file with no moves counts in `totalTime` in every planner (`TimingBuilder.finish` adds the leftover lead; Klipper dwells it when no move was held); the constant-speed planner now honours G4 (one map of dwells per move).
- GCP-37: `ToolheadWindow(planner, parsed, timing, start, end).positionAt(t, out?)` gives the toolhead XYZ, the move's fed E and the tool at time t inside a window of moves (binary search, no allocation with `out`): Klipper moves follow their `trapezoidsFor` trapezoid and hold through G4 dwells; other planners run each move at constant speed between start times, holding G4 dwells. `moveAtTime(parsed, t)` finds the move running at t.
- GCP-90: the RRF planner clamps M204 P/T/S to 0.1 mm/s² as RepRapFirmware does (Configuration.h:56), so M204 P0 or S0 no longer makes the total NaN.
- GCP-91: the RRF planner honours the latest of M204 S, P and T (S sets print and travel), so M204 S after M204 P changes the print acceleration (RepRapFirmware@aebf629 GCodes5.cpp:344-354).
- GCP-88: the Klipper planner drops reported moves from its queue every 4096 moves, so memory stays bounded on long files with no G4/M400 (was one 370-byte object per move until the end).

## 0.3.0

- GCP-23: `trapezoidsFor(planner, parsed, timing, start, end)` returns each move's `Trapezoid` (start time, entry, cruise, exit, accel), recomputed from the nearest checkpoint; a property test over random windows checks it equals the full pass. A checkpoint may carry the planner's `state` snapshot (`TimingBuilder.snapshot`, `snapshotDue`, `replay`, `stop`); `Planner.plan` takes an optional `Replay`. The Klipper planner snapshots (checkpoints at the first resumable move per interval, so not always at the multiple) and has `KlipperOptions.checkpointInterval`; the other planners keep stateless checkpoints and `trapezoidsFor` throws for them. `TimingBuilder.add` takes optional cruise, exit and accel; `MoveCursor.save`/`restore`. Spacing stays 4096, chosen by spike (about 1 ms per 1 s scrub window, 0.4-1.1 B/move).

- GCP-22: `test/klipper-rules.test.ts`, one test per Klipper planner rule with hand-derived expectations from klipper@ee2c6fb: junction at 90 and 180 degrees, minimum cruise ratio on a zig-zag, lookahead flush on a long straight, arc segmentation count, and M201/M203/M205 ignored. Tests only.

- GCP-82: the Klipper planner re-cuts G2/G3 at `[gcode_arcs] resolution` (klipper@ee2c6fb `gcode_arcs.py:100-175`): the parser's Arc chords are refitted to their circle and timed as `max(1, floor(arc length / resolution))` equal segments, so the time no longer depends on the parser's tolerance. The chords share the arc's time by length. New `KlipperOptions.resolution` (mm, default 1; must be > 0). New `src/domain/arc.ts` (`fitArc`, `arcPoint`, `resegmentArc`); `marlin.ts` `planArc` shares its circle fit.

- GCP-27: `rrfPlanner` (RepRapFirmware 3.6, `estimate: true`), written from `docs/research/rrf-planner.md`: per-drive M201/M203 box limits, M204 P/T (S stands in), M566 jerk per drive, joins only between moves that match on printing / XY / non-printing E, 40-move backward and forward lookahead, pressure-advance cap on E accel, arc chords re-segmented to RRF's turn, G4 dwell. `FLAVOUR_DEFAULTS.reprapfirmware` now holds RRF's values and `FLAVOUR_FIELDS.reprapfirmware` adds `minFeedrate`; `plannerFor` routes RepRapFirmware to `rrfPlanner` (change in `bambu.ts`, GCP-28's file).

- GCP-83: the planners read time from the file's markers (`@vsslicer/gcode-api` ^0.5.0, `Marker.seconds`). Klipper adds every `G4` dwell and `; ESTIMATOR_ADD_TIME` (a full flush each, as before), also after the last move; `KlipperOptions.addTime` stays for macro time the caller knows of. Marlin and Buddy now synchronize at `G4` (the queue runs out, the next move starts from its safe speed) and add its dwell. `TimingBuilder.dwell(seconds)` charges standstill time to the last move (before any move, to the first). The harness checks G4 dwell (`checkDwell`).

- GCP-28: `bambuPlanner`, the labelled Bambu estimate: the Marlin model (profile jerk and accel, the file's M201-M205) with `estimate: true`. Its `BambuTiming` adds `limitsSource` (`profile`, `default` or `mixed`) and `conditionalBlocks` (M622...M623 ranges, timed as executed). `isBambuFile`, `conditionalBlocks`, and `plannerFor(parsed, limits)` routes Bambu, Klipper and Marlin files.

- Fix (GCP-85): a zero or negative accel or velocity no longer makes the Klipper total time NaN. `resolveLimits` rejects an override of 0 for `accel` and `maxVelocity` (as the config reader ignores them; Marlin's per-axis maxima keep 0 as "no limit"), and the planner ignores a non-positive `SET_VELOCITY_LIMIT VELOCITY`.

## 0.2.1

- Fix (GCP-24 review): the Marlin and Buddy lookahead window is the busy block plus 14, as Marlin's ring holds BLOCK_BUFFER_SIZE - 1 blocks including the busy one (Marlin@2ef3ee6 `planner.h:917`); it was one block deeper. The steady-state lookahead test now pins the exact time. Header says the port follows PrusaSlicer, not Marlin's kennovo correction or `minimum_planner_speed_sqr`.

## 0.2.0

- GCP-20: Klipper planner, ported from klipper@ee2c6fb `klippy/toolhead.py`: `klipperPlanner` and `createKlipperPlanner(KlipperOptions)`. Constant-accel trapezoids, junction deviation from `square_corner_velocity`, centripetal cap, `minimum_cruise_ratio`, lazy time-based lookahead flush and a full flush at G4/M400, SET_VELOCITY_LIMIT, M204 S / min(P, T), Z and extrude-only limits, E junction, firmware retraction (G10/G11), macro time via `addTime`. M201/M203/M205 are ignored. Not yet: `[gcode_arcs] resolution` segmentation and `; ESTIMATOR_ADD_TIME` from the file.
- GCP-24: Marlin 2 and Prusa Buddy planners, ported from PrusaSlicer@30ef591 libpgcode and checked against Marlin@2ef3ee6 `planner.cpp`: `marlinPlanner`, `buddyPlanner`, `marlinFamilyPlanner(variant)`, `marlinArcSegments`, `buddyArcSegments`, `BLOCK_BUFFER_SIZE`. 16-block reverse and forward pass, junction deviation or classic jerk, M201/M203/M204/M205, firmware arc segmentation with duration hints, linear-advance accel cap; Buddy clamps M204 to the machine maxima. Marlin flavour defaults confirmed against Marlin@2ef3ee6 Configuration.h.
- Fix (GCP-19 review): limit precedence is defined per field as override > the file's own limit command > config block > flavour default. Both planners read limits through the new `MoveCursor.limit`, so a user override is no longer beaten by the file's M201/M203/M204/M205 (Marlin) or SET_VELOCITY_LIMIT/M204 (Klipper). The test harness checks it (`checkLimitPrecedence`) and that a planner yields at least once per move buffer. `sources` and `assumed` describe starting values only (documented).
- Depends on `@vsslicer/gcode-api` ^0.4.1.

## 0.1.0

- GCP-19: planner contract. `MachineLimits` with `resolveLimits` (override, config block, flavour defaults; per-field source, `assumed` and `flavourAssumed` flags), `Planner`, `Timing` (start times in the move buffer, f64 per-layer, per-role and travel tables, checkpoints), `runPlanner` (AbortSignal, progress) and `planSync`, `MoveCursor`, `TimingBuilder`, and `constantSpeedPlanner`.
