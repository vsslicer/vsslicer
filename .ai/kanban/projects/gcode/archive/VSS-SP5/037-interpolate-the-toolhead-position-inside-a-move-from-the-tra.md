---
id: 37
title: Interpolate the toolhead position inside a move from the trapezoid
type: feature
priority: P0
effort: M
model: opus
area: [simulation]
story: US12
milestone: "VSS:M1"
sprint: "VSS:SP5"
depends_on: [23]
created: 2026-10-25
---

Position at time t from E4's `trapezoidsFor` window.

## Acceptance criteria

- [x] Within 0.01 mm of the planner trapezoid in unit tests for accel, cruise, decel, zero-length moves, moves shorter than the accel distance, arcs (segments from E3), G4 pauses and tool changes

## Tasks

- [x] Window fetch and cache
- [x] Interpolation function
- [x] Edge-case tests

## Progress

Done (gcode-planner, domain), by gcp37-worker.

- `src/domain/interp.ts` (new): `ToolheadWindow(planner, parsed, timing, start, end)` builds moves `start..end` once (one Float64Array, 17 fields per move); `positionAt(t, out?)` returns `{move, x, y, z, e, tool}` by binary search over start times plus a closed-form trapezoid, writing into `out` (no allocation). `e` is the filament this move has fed so far. `moveAtTime(parsed, t)` binary-searches the f32 record start times so the timeline can pick its window. `profiled`, `startTime`, `endTime` exposed.
- Klipper (resumable checkpoints): each move follows its `trapezoidsFor` trapezoid, then holds at its end point for the rest of its duration, which is where Klipper charges G4, `ESTIMATOR_ADD_TIME` and `addTime`; a dwell before move 0 holds at the start point. Profile length is XYZ, or |E| for an extrude-only move (Klipper's move_d), so retracts keep XYZ still and feed `e`. A trapezoid that does not fit its move (Klipper's arc chords, whose profile summarises the overlapped re-cut segments and whose time is a share by length) runs at constant speed over its duration.
- Fallback for every other planner (`trapezoidsFor` throws for them): constant speed from each move's f32 start time to the next one's, less the seconds of the G4 markers after it, which hold. Documented in the class doc comment.
- Tests `test/interp.test.ts` (8): accel/cruise/decel of a 200 mm move and a 4 mm triangle; zero-length and extrude-only moves; G4 hold after a move and before move 0; tool change (continuity, `tool`); a 40-chord G2 arc (on each chord, monotone, continuous, on the circle within the sagitta); a 60-move window equal to the whole-file window and to `moveAtTime`; the constant-speed fallback with a G4; `moveAtTime` across buffers. Reference is a numeric integration of min(entry + a t, cruise, exit + a (T - t)), not interp.ts's closed form; dropping the decel term fails 5 of 8.
- Verified: `pnpm install --frozen-lockfile` (lockfile unchanged), `pnpm lint` clean, `pnpm test` 9 files / 92 tests pass, `pnpm build` ok.
- Not done: arc chords are not interpolated along Klipper's re-cut segments (constant speed per chord when the summary profile does not fit; error bounded by the chord's own speed variation). Fallback start times are f32 (about 4 ms resolution ten hours in).
- CHANGELOG (Unreleased): `- GCP-37: \`ToolheadWindow(planner, parsed, timing, start, end).positionAt(t, out?)\` gives the toolhead XYZ, the move's fed E and the tool at time t inside a window of moves (binary search, no allocation with \`out\`): Klipper moves follow their \`trapezoidsFor\` trapezoid and hold through G4 dwells; other planners run each move at constant speed between start times, holding G4 dwells. \`moveAtTime(parsed, t)\` finds the move running at t.`
- Files: `vsslicer/modules/gcode-planner/src/domain/interp.ts` (new), `vsslicer/modules/gcode-planner/test/interp.test.ts` (new), `vsslicer/modules/gcode-planner/src/index.ts` (one export line). Notes: `.reference/notes/GCP-37-toolhead-interp.md`.
- Review (gcp37-review): PASS. `pnpm install --frozen-lockfile` (lockfile unchanged), lint, test (9 files / 94 tests, with the other lane's work), build all pass. Tests' reference is a midpoint integration of min(entry + a t, cruise, exit + a (T - t)) from the planner's own trapezoid fields, not interp.ts's closed form, plus a hand-pinned 5 mm at 0.1 s: not tautological. Probe (scratch, 400 mixed moves: extrusions, travels, retracts, zero-length, arc chords, G4 before move 0, mid-file and after the last move; Klipper and constant-speed): max displacement per 10 µs step over the whole file is 1.2e-3 mm (= the 120 mm/s feed, so no jump at any move boundary or hold); windows 0..50, 50..131, 131..400 match the whole-file window to 2e-14 mm and meet at their edges; `moveAtTime` agrees with `positionAt().move` at 2000 instants; 1e6 `positionAt(t, out)` calls leave the heap flat. `positionAt` is a binary search plus closed form, no allocation with `out`; t outside the window clamps to the first move's start / last move's end (NaN t gives NaN, harmless). f32 claim checked: ulp at 36000 s is 2^-8 s, about 3.9 ms. Constant-speed fallback (start time to next, G4 held at the end point) is continuous and fine for GCP-38's marker. Minor, not blocking: `moveAtTime` uses f32 start times while a Klipper window uses f64, so near a boundary late in a long print it can pick the neighbouring move (positionAt clamps, error within one f32 ulp of motion).
