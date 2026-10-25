# @vsslicer/gcode-api

The shared G-code model: domain types only, no I/O. `@vsslicer/gcode-parser` implements `Parse`;
`toolhead-sim` and the `gcode-preview` webview read its output.

```ts
type Parse = (source: AsyncIterable<Uint8Array>, opts?: { signal?: AbortSignal }) => AsyncIterable<Chunk>;
```

- `Chunk`: one increment of a streaming parse: a move buffer (`ArrayBuffer`, meant to be
  transferred, not copied), its `firstMove` and `moveCount`, the layers that start in it, markers,
  diagnostics, `bytesRead` for progress, and the detected `slicer`.
- `ParsedFile`: all chunks in file order: `slicer`, `moveCount`, `moves` (the chunk buffers, not
  concatenated, so a large file never needs twice its memory), `layers`, `markers`, `diagnostics`.
- `Layer`: `{ z, firstMove }`; layer `i` runs to the next layer's `firstMove` (or `moveCount`).
- `Marker`: a command kept by name, not interpreted: `{ name, fileOffset, moveIndex }`.
- `Diagnostic`: `{ code, severity: 'error' | 'warning' | 'info', fileOffset, message }`.

## Move record

Each move is one interleaved 28-byte record (`MOVE_STRIDE`), little-endian. A move is the
segment from the previous move's position to its own.

| Offset | Size | Type   | Field        | Meaning |
|-------:|-----:|--------|--------------|---------|
|      0 |   12 | f32 x3 | `position`   | End point X, Y, Z in mm, absolute |
|     12 |    2 | f16    | `width`      | Extrusion width in mm; 0 if not extruding |
|     14 |    2 | f16    | `height`     | Extrusion height in mm; 0 if not extruding |
|     16 |    1 | u8     | `role`       | `MoveRole` (libvgcode's extrusion-role order, plus `Unknown` = 20) |
|     17 |    1 | u8     | `tool`       | Tool index, T0 = 0 |
|     18 |    1 | u8     | `flags`      | `MoveFlag` bits: `Travel`, `Retract`, `Unretract`, `Wipe`, `Arc` |
|     19 |    1 | -      | padding      | Always 0 |
|     20 |    4 | u32    | `fileOffset` | Byte offset of the source line (files up to 4 GiB) |
|     24 |    4 | f32    | `startTime`  | Seconds from print start; NaN until a planner fills it |

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
