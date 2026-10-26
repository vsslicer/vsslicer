# @vsslicer/gcode-planner

Times a parsed G-code file (`ParsedFile` from `@vsslicer/gcode-api`): the contract every firmware
planner implements, the limit resolution they share, and a constant-speed reference planner.
Domain and application code only: no I/O, no VS Code, runs in a worker or plain Node.

```ts
const limits = resolveLimits({ flavour: headerFlavourName, config: parsed.config, override: userLimits });
const timing = await runPlanner(constantSpeedPlanner, parsed, limits, { signal, onProgress });
```

- `resolveLimits({ flavour?, config?, override? })`: each `MachineLimits` field from the override,
  else the file's config block (PrusaSlicer/SuperSlicer, Orca/Bambu and Cura keys; first value of
  `normal,silent` lists), else the flavour defaults. `sources[field]` says which. `assumed` is true
  when a field the flavour's planner reads (`FLAVOUR_FIELDS`) came from the defaults (always the
  case for Klipper's `printer.cfg` limits unless overridden). The flavour comes from `flavour`,
  else `config.gcode_flavor`; a missing or unknown name falls back to Marlin with
  `flavourAssumed: true`.
- `Planner`: `{ name, estimate, plan(parsed, limits): Generator<movesDone, Timing> }`. It writes
  each move's start time (f32, seconds) into the move record's `startTime` field in place, and
  yields at least once per move buffer.
- Limit precedence, per field: override > the file's own limit command (M201/M203/M204/M205 for
  Marlin, SET_VELOCITY_LIMIT and M204 for Klipper) > config block > flavour default. Planners read
  limits through `MoveCursor.limit`, and `test/harness.ts` `checkLimitPrecedence` checks it.
  `sources` and `assumed` describe the starting values only; they do not see in-file commands.
- `Timing`: `totalTime`, `layerTimes` (per `parsed.layers` row), `roleTimes` (per `MoveRole`,
  non-travel moves) and `travelTime`, all f64; `checkpoints` (`{ move, time, speed, state? }`
  about every `checkpointInterval` = 4096 moves) so a window can be recomputed later without
  per-move speeds.
- `trapezoidsFor(planner, parsed, timing, start, end)`: entry, cruise, exit and accel of moves
  `start` to `end`, recomputed from the nearest checkpoint's planner snapshot; equal to the full
  pass. Klipper snapshots; the other planners throw for now.
- `runPlanner(planner, parsed, limits, { signal, onProgress })`: one move buffer per slice, a
  macrotask between slices so an abort reaches it; `planSync` runs it in one go.
- `MoveCursor` and `TimingBuilder`: the move walk (positions across chunks, E, state changes in
  force) and the bookkeeping (start times, tables, checkpoints), so a planner only computes each
  move's duration.

Licence: AGPL-3.0-or-later.
