# @vsslicer/gcode-api

The shared G-code model: domain types only, no I/O. `@vsslicer/gcode-parser` implements `Parse`;
`toolhead-sim` and the `gcode-preview` webview read its output.

```ts
type Parse = (source: AsyncIterable<Uint8Array>, opts?: { signal?: AbortSignal }) => AsyncIterable<Chunk>;
```

- `Chunk`: one increment of a streaming parse: a move buffer, an extrusion column and a
  state-change table (`ArrayBuffer`s, meant to be transferred, not copied), its `firstMove` and
  `moveCount`, the layers that start in it, markers, diagnostics, `bytesRead` for progress, and
  the detected `slicer`.
- `ParsedFile`: all chunks in file order: `slicer`, `moveCount`, `moves`, `extrusion` and
  `stateChanges` (the chunk buffers, not concatenated, so a large file never needs twice its
  memory), `layers`, `markers`, `diagnostics`.
- `Layer`: `{ z, firstMove }`; layer `i` runs to the next layer's `firstMove` (or `moveCount`).
- `Marker`: a command kept by name and **not** interpreted (unknown or out-of-scope commands,
  pauses such as M600): `{ name, fileOffset, moveIndex }`. Interpreted modal commands (F, fan,
  temperatures, limits, pressure advance, tool changes) are never markers; they are state changes.
- `Diagnostic`: `{ code, severity: 'error' | 'warning' | 'info', fileOffset, message }`.

## Move record

Each move is one interleaved 28-byte record (`MOVE_STRIDE`), little-endian. A move is the
segment from the previous move's position to its own: move `i` starts at record `i - 1` and ends
at record `i`. At a chunk boundary the first move of a chunk starts at the **last record of the
previous chunk**, so a renderer or simulator carries that position over (for example, by
drawing the boundary segment from the kept last position); global move 0 starts at the machine
position before the first move.

| Offset | Size | Type   | Field        | Meaning                                                            |
| -----: | ---: | ------ | ------------ | ------------------------------------------------------------------ |
|      0 |   12 | f32 x3 | `position`   | End point X, Y, Z in mm, absolute                                  |
|     12 |    2 | f16    | `width`      | Extrusion width in mm; 0 if not extruding                          |
|     14 |    2 | f16    | `height`     | Extrusion height in mm; 0 if not extruding                         |
|     16 |    1 | u8     | `role`       | `MoveRole` (libvgcode's extrusion-role order, plus `Unknown` = 20) |
|     17 |    1 | u8     | `tool`       | Tool index, T0 = 0                                                 |
|     18 |    1 | u8     | `flags`      | `MoveFlag` bits: `Travel`, `Retract`, `Unretract`, `Wipe`, `Arc`   |
|     19 |    1 | -      | padding      | Always 0                                                           |
|     20 |    4 | u32    | `fileOffset` | Offset of the source line in the decoded text (see below)          |
|     24 |    4 | f32    | `startTime`  | Seconds from print start; NaN until a planner fills it             |

Every field sits at a multiple of its element size and the stride is a multiple of 4, which is
what WebGL2 `vertexAttribPointer` / `vertexAttribIPointer` require, so the renderer uploads the
buffer as is and binds instanced attributes straight onto it, for example:

```js
// instance i draws move i + 1: its start is record i, everything else is record i + 1
gl.vertexAttribPointer(aStart, 3, gl.FLOAT, false, MOVE_STRIDE, MoveOffset.position);
gl.vertexAttribPointer(aEnd, 3, gl.FLOAT, false, MOVE_STRIDE, MOVE_STRIDE + MoveOffset.position);
gl.vertexAttribPointer(aSize, 2, gl.HALF_FLOAT, false, MOVE_STRIDE, MOVE_STRIDE + MoveOffset.width);
gl.vertexAttribIPointer(aRoleToolFlags, 3, gl.UNSIGNED_BYTE, MOVE_STRIDE, MOVE_STRIDE + MoveOffset.role);
```

`readMove(view, i)` and `writeMove(view, i, move)` decode and encode one record over a
`DataView`, for tests and edges; hot loops use the `DataView` or typed views with `MoveOffset`.

## File offsets

Every `fileOffset` (moves, markers, diagnostics) is a byte offset in the **decoded G-code text
stream**: the file's own bytes for `.gcode`; for `.bgcode`, the offset in the decoded G-code text
(the text twin of its G-code blocks), not in the binary container. A container error points at
the decoded text reached when it was found. Offsets are u32: once the decoded text passes 4 GiB
the parser ends the parse with an `error` diagnostic `offset-overflow` at `fileOffset`
0xFFFFFFFF; it never wraps an offset.

## Extrusion column

`Chunk.extrusion` holds one little-endian f32 per move (`moveCount * 4` bytes): the filament
length in mm the move feeds, negative for a retract, after M82/M83 and G92 are applied. Arc chords
share their arc's E in proportion to length; firmware retracts (G10/G11) are 0 with the
`Retract`/`Unretract` flag set. Planners (extruder limits, linear-advance cap, retract time) and
filament totals read it; the renderer does not upload it (width and height already describe the
bead).

## State-change table

`Chunk.stateChanges` is a sparse table of the modal changes the parser interprets: one 12-byte
little-endian record (`STATE_CHANGE_STRIDE`) per change, sorted by `moveIndex`, ties in file
order (the later one wins).

| Offset | Size | Type | Field       | Meaning                                                             |
| -----: | ---: | ---- | ----------- | ------------------------------------------------------------------- |
|      0 |    4 | u32  | `moveIndex` | Global index of the first move run under the new value              |
|      4 |    4 | f32  | `value`     | New value, in the unit of its kind (mm/s, mm/s^2, mm, s, degrees C) |
|      8 |    1 | u8   | `kind`      | `StateKind`                                                         |
|      9 |    1 | u8   | `index`     | Tool, fan or axis it applies to (X 0, Y 1, Z 2, E 3); 0 if only one |
|     10 |    2 | -    | padding     | Always 0                                                            |

Kinds: `Feedrate` (F), `Fan` (M106/M107, 0..1), `HotendTemp` (M104/M109), `BedTemp`
(M140/M190), `Accel`/`AccelPrint`/`AccelRetract`/`AccelTravel` (M204 S/P/R/T, Klipper `ACCEL`),
`MaxAccel` (M201), `MaxFeedrate` (M203), `Jerk` (M205 XYZE, RRF M566), `JunctionDeviation`,
`MinFeedrate`, `MinTravelFeedrate` (M205 J/S/T), `MaxVelocity`, `AccelToDecel`,
`MinCruiseRatio`, `SquareCornerVelocity` (`SET_VELOCITY_LIMIT`), `PressureAdvance`,
`PressureAdvanceSmoothTime` (M900, M572, `SET_PRESSURE_ADVANCE`) and `ToolChange` (`T<n>`).
Values are converted to the kind's unit whatever the command used (F and M566 in mm/min become
mm/s). The table records what the file commanded; each firmware planner decides what it honours.

A change whose command shares a line with a move (`G1 X10 F3000`) has that move's index; a
command on its own line has the next move's index (`moveCount` if none follows). A chunk carries
the changes it read, so `moveIndex` can be `firstMove + moveCount` when the next move lands in the
next chunk. Only changes are stored: the state at any move is the table folded from the start,
carried across chunks like the position. `readStateChange` and `writeStateChange` decode and
encode one record.
