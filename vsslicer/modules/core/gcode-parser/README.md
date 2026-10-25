# @vsslicer/gcode-parser

Streaming G-code text parser. Implements `Parse` from `@vsslicer/gcode-api`: bytes in, `Chunk`s
out (moves, extrusion column, state-change table, markers, diagnostics). Pure Node/ES, no VS Code.

```ts
import { fileSource, parse } from '@vsslicer/gcode-parser';

for await (const chunk of parse(fileSource('benchy.gcode'), { flavour: 'marlin' })) {
  // transfer chunk.moves / extrusion / stateChanges to a worker or renderer, then drop the chunk
}
```

Layers: `src/domain` (tokeniser, modal state machine and command handlers, chunk writer, line
splitter; pure), `src/application` (`parse`), `src/adapters` (`fileSource`, a Node file stream).

## Options (`parse(source, options)`)

| Option       | Default  | Meaning                                                                                                 |
| ------------ | -------- | ------------------------------------------------------------------------------------------------------- |
| `signal`     | none     | Abort; the iterator rejects with the reason.                                                            |
| `flavour`    | `marlin` | `marlin`, `klipper` or `reprapfirmware`; only decides units (below). GCP-4 detects it and passes it in. |
| `chunkMoves` | 65536    | A chunk ends after this many moves (about 2.2 MB of buffers).                                           |
| `chunkBytes` | 4 MiB    | A chunk also ends after this many decoded bytes, so progress flows through comment-heavy files.         |
| `baseOffset` | 0        | Offset of the first byte in the decoded text; for resuming and for testing the 4 GiB rule.              |

A leading UTF-8 BOM is skipped (offsets still count it).

Memory is bounded by one chunk plus one partial line, whatever the file size: the working buffers
are reused and each chunk gets fresh copies of the used part. A line longer than 1 MiB is skipped
with the warning `line-too-long`.

## What is interpreted

| Command                                      | Result                                                                                                                                                                                                              |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `G0` `G1`                                    | Move (a record only if an X, Y, Z or E word is present; `G1 F3000` alone is only a feedrate change).                                                                                                                |
| `G2` `G3`                                    | **One** move to the end point with the `Arc` flag; tessellation is GCP-9. I/J/R ignored.                                                                                                                            |
| `G10` `G11`                                  | In-place move with `Retract` / `Unretract`, E = 0. With `P` or `L` (RRF tool offsets) a marker.                                                                                                                     |
| `G17` `G18` `G19`                            | Plane state (for arcs); no record.                                                                                                                                                                                  |
| `G90` `G91` `M82` `M83`                      | Positioning modes. E is relative after M83 or while G91 is on (as PrusaSlicer: G91 wins over M82; Marlin also lets M83+G90 revert E to absolute, we keep it relative). M82 makes E absolute again unless G91 is on. |
| `G92`                                        | Offsets the origin so the machine position stays continuous (as PrusaSlicer); `E` sets the extruder reference. No record.                                                                                           |
| `G21`                                        | No-op (millimetres is the only unit). `G20` and every other command: marker.                                                                                                                                        |
| `F`                                          | `Feedrate` state change, mm/min to mm/s.                                                                                                                                                                            |
| `T<n>`                                       | `ToolChange` (0..254; larger, such as Bambu's `T1000`, is a marker); sets the `tool` of later moves.                                                                                                                |
| `M104` `M109` `M140` `M190`                  | `HotendTemp` (`T`, else the active tool) and `BedTemp`. `S`, or `R` on M109/M190.                                                                                                                                   |
| `M106` `M107`                                | `Fan` 0..1 (`P` = fan). `M106` without `S` is 1. RRF: `S` <= 1 is already a fraction.                                                                                                                               |
| `M204` `M201` `M203` `M205` `M566`           | `Accel*`, `MaxAccel`, `MaxFeedrate`, `Jerk` / `JunctionDeviation` / `MinFeedrate` / `MinTravelFeedrate`, RRF `Jerk`.                                                                                                |
| `M900` `M572`                                | `PressureAdvance` (`M900 K` with `T`, `M572 S` with `D`).                                                                                                                                                           |
| `SET_VELOCITY_LIMIT`, `SET_PRESSURE_ADVANCE` | Klipper kinds, `KEY=value`, case-insensitive.                                                                                                                                                                       |

Everything else (`G4` dwell, `G28`, `M73`, `M600`, `M486`, `EXCLUDE_OBJECT_*`, ...) is a `Marker`
with its upper-cased name, file offset and next move index. `G4` stays a marker: no state kind
exists for a dwell yet.

Role is `Unknown`, width and height 0, `startTime` NaN, `layers` empty and `slicer` `unknown` until
the cards that read slicer comments (roles, layers, detection) land.

## Decisions

- **Only changes are stored.** A state change equal to the last recorded value of the same kind
  and index is dropped, for every kind (a repeated `F`, `M106 S255`, `M104 S200`). The last values
  persist across chunks. The initial tool is 0, so a leading `T0` is not a row; the first value of
  any other kind always is.
- **Units** are the kind's unit (see gcode-api). Flavour-dependent: RRF `M203` and `M566` are
  mm/min and divided by 60; Marlin and Klipper `M203` are mm/s. `F` is always mm/min.
- **Klipper `SET_PRESSURE_ADVANCE EXTRUDER=<name>`**: `extruder` maps to index 0, `extruder1` to
  1, `extruder<n>` to n; without `EXTRUDER` the active tool. Any other name emits the warning
  `unknown-extruder` and changes nothing.
- **Change index**: a change on a move's line gets that move's index, a change on its own line the
  next move's index (the number of moves written so far).
- **4 GiB**: every move stores its line's offset in the decoded text. When a line would start past
  0xFFFFFFFF the parser emits the error `offset-overflow` at 0xFFFFFFFF, ends the final chunk and
  stops reading the source. It never wraps.
- **Positions** are machine coordinates (file coordinates plus the G92 origin), in f32.
- Not handled yet: `G28` homing position (position is left as is), `G20` inches, `M220`/`M221`
  overrides (markers).

## Golden corpus

`test/fixtures` holds the corpus (see its `PROVENANCE.md` files) and `test/golden/*.json` its
expected summary: `moveCount`, `stateChanges`, `markers`, `diagnostics` for text G-code, byte size
and hash for all (binary files get more with GCP-7). `pnpm golden:update` rewrites them; review
the diff. A test counts the move lines of every text file independently and compares.

## Develop

`pnpm install && pnpm lint && pnpm test && pnpm build`. The 100 MB heap test takes about 2 s; set
`GCODE_SKIP_HEAP_TEST=1` to skip it.
