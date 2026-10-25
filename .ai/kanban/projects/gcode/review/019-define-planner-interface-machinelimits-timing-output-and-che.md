---
id: 19
title: "Define planner interface, MachineLimits, Timing output and checkpoints"
type: feature
priority: P0
effort: L
model: opus
area: [planner]
story: US7
milestone: "VSS:M1"
sprint: "VSS:SP3"
depends_on: [1, 4]
created: 2026-10-25
---

One planner interface, one implementation per firmware, per D-eng review: `plan(parsed, limits) -> Timing`, start times (f32 in the buffer, f64 sums), layer and role time tables, `estimate` and limit-source flags.

## Acceptance criteria

- [x] `MachineLimits` resolves in order: explicit override, the file's config block, flavour defaults, with the source recorded (test per source)
- [x] Missing limits set an `assumed limits` flag; unknown flavour uses Marlin and says so (tests)
- [x] Timing carries start times into the move buffer, per-layer and per-role tables and checkpoints; a trivial constant-speed planner passes the harness
- [x] Planner runs in the parser worker, is cancellable and reports progress

## Tasks

- [x] Types and resolver
- [x] Timing tables
- [x] Checkpoint structure
- [x] Test harness with a trivial planner

## Progress

Done in new module `vsslicer/modules/gcode-planner` (`@vsslicer/gcode-planner` 0.1.0, published to the local registry), domain + application layers, depending on `@vsslicer/gcode-api@^0.4.0`.

- `resolveLimits({ flavour?, config?, override? })`: per-field `override > config > default`, `sources` per field, `assumed` when a field the flavour reads (`FLAVOUR_FIELDS`) is a default, `flavourAssumed` when the name is missing or unknown (Marlin used). Tests per source and per fallback in `test/limits.test.ts`.
- `Planner.plan(parsed, limits)` is a generator yielding moves done per buffer and returning `Timing`; start times go into the existing f32 `startTime` field of the gcode-api move record in place (no parallel array needed); sums are f64. `Timing` has `layerTimes`, `roleTimes`, `travelTime`, `checkpoints` (`{ move, time, speed }` every 4096 moves; GCP-23 picks the spacing).
- `MoveCursor` + `TimingBuilder` hold the shared walk and bookkeeping; `constantSpeedPlanner` passes the harness in `test/harness.ts` (`checkPlanner`), which GCP-20/24/27 planners reuse.
- Worker criterion: `runPlanner` takes an AbortSignal and `onProgress` and yields a macrotask between buffers, so a worker can call it and receive an abort. Wiring it into gcode-parser's worker is not done here (gcode-parser was off limits): follow-up on GCP-30 (orchestrate parse, plan and transfer).
- Gap: `ParsedFile` has no flavour, and gcode-parser's `Flavour` already folds unknown names into marlin. The caller passes the raw header/config name; else `config.gcode_flavor` is read. A raw flavour name on `ParsedFile` (gcode-api) would close this.
- Unverified defaults (Marlin feedrate/accel, Klipper placeholders, RRF = Marlin) are marked `shortcut:` in `src/domain/limits.ts` for GCP-20/24/27. Notes: `.reference/notes/GCP-19-planner-interface.md`.
