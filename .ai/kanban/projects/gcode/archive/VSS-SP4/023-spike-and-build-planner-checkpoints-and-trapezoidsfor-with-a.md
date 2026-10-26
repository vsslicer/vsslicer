---
id: 23
title: Spike and build planner checkpoints and trapezoidsFor with a property test
type: feature
priority: P0
effort: M
model: opus
area: [planner]
story: US7
milestone: "VSS:M1"
sprint: "VSS:SP4"
owner: GCP-23-worker
depends_on: [20]
created: 2026-10-25
---

Checkpoints replace storing entry, cruise and exit speeds per move (about 12 bytes per move) so E5 can recompute any window.

## Acceptance criteria

- [x] Spike measures checkpoint spacing against recompute cost for a 1-second scrub window; the chosen spacing is recorded in a note in `.reference/notes/`
- [x] `trapezoidsFor(range)` returns entry, cruise, exit and accel for any window
- [x] Property test over random windows: recompute equals the full pass

## Tasks

- [x] Measure spacing options
- [x] Implement checkpoints and `trapezoidsFor`
- [x] Property test
- [x] Record the spacing

## Progress

Done (gcode-planner, domain; PUBLISH no, CHANGELOG under Unreleased).

- A checkpoint may carry `state`, the planner's structured-cloneable snapshot at a resumable
  point. `TimingBuilder.snapshotDue` / `snapshot(state)` take it; `TimingBuilder.replay(parsed, cp,
  start, end)` records `Trapezoid`s (move, f64 start, entry, cruise, exit, accel) for a window and
  sets `stop` at its end. `Planner.plan(parsed, limits, replay?)`; `add` takes optional cruise,
  exit, accel. `MoveCursor.save/restore`.
- `trapezoidsFor(planner, parsed, timing, start, end)` (src/domain/trapezoids.ts) resumes the
  planner from the last checkpoint at or before `start`. Exact by construction (same code, same f64
  order).
- Klipper snapshots its loop state (queue, pending parser slots, held move, arc, modal accel
  bookkeeping, retract state, cursor) at the first loop end where the emitted count reaches each
  multiple of the interval, so its checkpoints sit at or just after the multiple; the harness now
  accepts that for snapshotting planners. `KlipperOptions.checkpointInterval`. Arc chords report
  first-segment entry, top cruise, last-segment exit.
- Spike: 500k-move synthetic mixed and dense files, intervals 256 to 65536. Chosen 4096 (unchanged):
  ~1 ms median, 5 ms max per 1 s window, 0.4-1.1 B/move of snapshots vs 12 B/move stored. Tables in
  `.reference/notes/GCP-23-checkpoint-spacing.md`.

Verified: `pnpm install && pnpm lint && pnpm test && pnpm build` in gcode-planner (79 tests).
`test/trapezoids.test.ts`: 3 seeds x 12k random moves (curves, lines, travel, retracts, G10/G11,
dropped moves, arcs, F/accel/SCV/velocity changes, G4/M400, layers) at intervals 97/256/1024: replay
of the whole file matches the full pass's f32 start times bit for bit and every checkpoint's time
and speed; 60 random windows each deep-equal the full replay's slice; edges; repeat replays; refusal
for non-snapshotting planners. Mutation: dropping the queue restore fails 3 tests.

Not done: Marlin, Buddy, RRF, Bambu and constant-speed do not snapshot; `trapezoidsFor` throws for
them (needs a follow-up card per planner, US8/US9). Spacing measured on synthetic files only.

Files: vsslicer/modules/gcode-planner/src/domain/trapezoids.ts (new), src/domain/timing.ts,
src/domain/planner.ts, src/domain/klipper.ts, src/domain/move-cursor.ts, src/index.ts,
test/trapezoids.test.ts (new), test/random-file.ts (new), test/harness.ts, README.md, CHANGELOG.md;
.reference/notes/GCP-23-checkpoint-spacing.md (new).
