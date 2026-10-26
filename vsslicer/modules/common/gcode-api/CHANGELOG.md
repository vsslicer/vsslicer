# Changelog

## Unreleased

- GCP-89: `flavourName?: string` on `Chunk` and `ParsedFile`: the flavour name the file states (`;FLAVOR:`, `; gcode_flavor =`, last wins), to pass to gcode-planner's `resolveLimits({ flavour })`.

## 0.5.0

- GCP-83: `Marker.seconds`, the time a command takes by itself: the `G4` dwell (as the file's flavour reads it, 0 when it states none) and the new `ESTIMATOR_ADD_TIME` marker for klipper_estimator's `; ESTIMATOR_ADD_TIME <seconds>` comment. Optional and additive; absent on every other marker.

## 0.4.1

- Build in `prepack`, so a plain `pnpm publish` never ships a stale or missing `dist`. (PLT-180)

## 0.4.0

- `JobSummary` (`extruders: ExtruderUsage[]` with `lengthMm`, `volumeCm3`, `weightG`, `cost`; `estimateSeconds: EstimateSeconds` with `normal`, `silent`, `model`, `total`): the slicer's own job statistics. All statistics optional; absent means the slicer did not state it. Additive.
- Dev: `@vsslicer/tooling` ^0.8.1.

## 0.3.0

- US2 metadata: `Thumbnail` / `ThumbnailFormat`, `ObjectLabel` / `MoveRange` and a config map, on `Chunk` (`thumbnails`, `objects`, `config`: each item arrives in the chunk where its block or range ends) and on `ParsedFile` (`thumbnails`, `objects` merged by name, id and copy, `config`). Additive except that code building a `Chunk` or `ParsedFile` by hand must add the three fields.
- Dev: `@vsslicer/tooling` ^0.8.0.

## 0.2.0

- `Chunk.extrusion` / `ParsedFile.extrusion`: one f32 E delta per move, beside the unchanged 28-byte move record.
- `Chunk.stateChanges` / `ParsedFile.stateChanges`: sparse 12-byte state-change table (`STATE_CHANGE_STRIDE`, `StateChangeOffset`, `StateKind`, `StateChange`, `readStateChange`/`writeStateChange`) for feedrate, fan, temperatures, acceleration and velocity limits, pressure advance and tool changes.
- Documented the segment start/end binding across chunks, decoded-text `fileOffset` (also for `.bgcode`), the `offset-overflow` diagnostic past 4 GiB, and that `Marker` is for uninterpreted commands only.
- `pnpm lint` runs the shared ESLint and Prettier configs from `@vsslicer/tooling` 0.4.0.

## 0.1.0

- Initial G-code model: `Parse` contract, `ParsedFile`, `Chunk`, layer table, markers, diagnostics, and the 28-byte move record (`MOVE_STRIDE`, `MoveOffset`, `MoveRole`, `MoveFlag`, `readMove`/`writeMove`).
