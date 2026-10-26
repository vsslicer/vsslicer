# @vsslicer/gcode-parser

Streaming G-code text parser. Implements `Parse` from `@vsslicer/gcode-api`: bytes in, `Chunk`s
out (moves, extrusion column, state-change table, markers, diagnostics, thumbnails, object labels, config). Pure Node/ES, no VS Code.

```ts
import { fileSource, parse } from '@vsslicer/gcode-parser';

for await (const chunk of parse(fileSource('benchy.gcode'), { flavour: 'marlin' })) {
  // transfer chunk.moves / extrusion / stateChanges to a worker or renderer, then drop the chunk
}
```

`readSummary(fileSource(path))` / `readSummaryFile(path)` return the slicer's own job statistics
(`JobSummary`: per-extruder filament length, volume, weight, cost; time estimates) from its summary
comments, without parsing moves. `readSummaryFile` reads only the first and last 512 KiB; a summary
comment elsewhere needs `readSummary(fileSource(path))`. Absent statistics are absent fields.
Filament totals come from these comments, not from summing the E column. Bambu Studio's `.gcode.3mf`
`slice_info.config` is not read yet (no fixture, Q10).

`collect(parse(...))` gives a `ParsedFile`. `transferList(chunk)` lists a chunk's buffers for
`postMessage(chunk, transferList(chunk))`; they are exact length and detach on transfer. The last
chunk is never empty: it exists only if it holds moves, state changes, markers or diagnostics.

Layers: `src/domain` (tokeniser, modal state machine and command handlers, chunk writer, line
splitter; pure), `src/application` (`parse`), `src/adapters` (`fileSource`, a Node file stream; `bgcodeSource`).

## Options (`parse(source, options)`)

| Option         | Default  | Meaning                                                                                                                                                      |
| -------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `signal`       | none     | Abort; the iterator rejects with the reason.                                                                                                                 |
| `flavour`      | detected | `marlin`, `klipper` or `reprapfirmware`; only decides units (below). **Overrides** the flavour the file names; absent, see "Slicer, flavour, roles, layers". |
| `chunkMoves`   | 65536    | A chunk ends after this many moves (about 2.2 MB of buffers).                                                                                                |
| `chunkBytes`   | 4 MiB    | A chunk also ends after this many decoded bytes, so progress flows through comment-heavy files.                                                              |
| `arcTolerance` | 0.05     | Largest distance in mm between a G2/G3 arc and its chords (see "Arcs").                                                                                      |
| `arcMaxAngle`  | 15       | Largest angle in degrees one arc chord may sweep (at most 180).                                                                                              |
| `baseOffset`   | 0        | Offset of the first byte in the decoded text; for resuming and for testing the 4 GiB rule.                                                                   |

A leading UTF-8 BOM is skipped (offsets still count it).

Memory is bounded by one chunk plus one partial line, whatever the file size: the working buffers
are reused and each chunk gets fresh copies of the used part. A line longer than 1 MiB is skipped
with the warning `line-too-long`, however the input is cut.

## What is interpreted

| Command                                      | Result                                                                                                                                                                                                              |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `G0` `G1`                                    | Move (a record only if an X, Y, Z or E word is present; `G1 F3000` alone is only a feedrate change).                                                                                                                |
| `G2` `G3`                                    | Tessellated into straight `Arc`-flagged moves ("Arcs" below).                                                                                                                                                       |
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
with its upper-cased name, file offset and next move index. A `G4` marker also carries
`seconds`, the dwell as the flavour reads it: Marlin and RRF take `S` (seconds) over `P` (ms),
Klipper only `P`; none stated, or a negative value, is 0. A whole-line `; ESTIMATOR_ADD_TIME <s> [label]`
comment (klipper_estimator's macro time) becomes an `ESTIMATOR_ADD_TIME` marker with `seconds`
(finite and >= 0, else the comment is ignored).

Width and height are 0 and `startTime` NaN until the cards that read them land.

## Slicer, flavour, roles, layers

Read from whole-line comments (`src/domain/slicer-tags.ts`; the tables with their upstream
provenance are in `src/domain/tag-tables.ts`):

| What    | Comments                                                                                                                                                                                                                                                                                              |
| ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Slicer  | In the first 100 comment lines: `; generated by PrusaSlicer` / `SuperSlicer` / `OrcaSlicer` / `BambuStudio`, `; BambuStudio 02.x`, Cura's `;Generated with Cura_SteamEngine` or `;FLAVOR:`. The first match wins; anything else is `unknown`. `Chunk.slicer` is `unknown` in chunks before the match. |
| Flavour | `; gcode_flavor = <name>` (PrusaSlicer, Orca, Bambu config block) and Cura `;FLAVOR:<name>`. `klipper` and `reprapfirmware` are taken as such, every other name (marlin, marlin2, Griffin, RepRap, ...) is `marlin`.                                                                                  |
| Role    | `;TYPE:<name>` (Prusa, Orca on Marlin printers, Cura) and `; FEATURE:<name>` (Bambu, Orca on Bambu printers). One name table for all slicers; the role is written into every move after the tag.                                                                                                      |
| Layer   | `;LAYER_CHANGE` (Prusa, Orca-Marlin), `; CHANGE_LAYER` (Bambu, Orca-Bambu), `;LAYER:<n>` (Cura). Layer `z`: `;Z:` or `; Z_HEIGHT:` after the change; without one (Cura) the first extruding move's z.                                                                                                 |

Decisions:

- **Flavour precedence**: the `flavour` option, else what the file names, else `marlin`. Detection
  works from the line that names the flavour on: Orca and Bambu name it in their header block,
  but PrusaSlicer only in the config block at the **end** of the file, so for PrusaSlicer the
  detected flavour is correct in the golden summary but earlier `M203`/`M566`/`M106` lines were
  read as Marlin. Pass `flavour` when a PrusaSlicer file targets RepRapFirmware.
- **Roles**: `Unknown` before the first role tag and for a tag name that is not in the table (one
  `unknown-role` warning per distinct name, at most 8). Travel and retract moves carry the role of
  the last tag as well; filter by the move flags. Bambu's `Floating vertical shell` is
  `Perimeter`, `Support ironing` `Ironing`, `Flush` `WipeTower` (no exact role exists). Cura's
  `SKIN` is `SolidInfill`. SuperSlicer's `Internal perimeter` is `Perimeter`, `Thin wall` `GapFill`, `Internal bridge infill` `InternalBridgeInfill`, `Milling` `Custom`; `;MESH:` is ignored (there is nowhere to store the object name yet).
- **Layers** are listed in the chunk that holds the layer's first move, `firstMove` global. A
  layer change with no move before the next one is dropped. A layer whose z the slicer does not
  state starts with the first move's z, corrected to the first extrusion's if that is in the
  same chunk.
- **No tags**: roles stay `Unknown`, `layers` is empty, and at the end of the file one `info`
  diagnostic `no-slicer-tags` says which tags were missing (only if the file had moves).

## Arcs

`G2` (clockwise) and `G3` (counter-clockwise) become several straight moves, so consumers draw only
segments. Semantics follow Marlin's `plan_arc`/`G2_G3` (provenance in `src/domain/arc.ts`).

- **Plane**: `G17` XY with `I J`, `G18` ZX with `K I` (Z is the first axis, so G2 is clockwise seen
  from +Y, as Marlin; Klipper differs), `G19` YZ with `J K`. The remaining axis is interpolated
  evenly (helix). `I J K` are always relative to the start; `G90.1`/`G91.1` are not interpreted.
- **R form**: the centre is on the perpendicular bisector of the chord; a negative R takes the arc
  over 180 degrees. R wins over `I J K` when both are given. Start == end in the plane (within
  0.0001 mm) with `I J K` is a full circle (in the direction of G2/G3); with R it is invalid.
- **Chords**: equal angle, so equal length; the angle is the smaller of `2*acos(1 - arcTolerance/r)`
  and `arcMaxAngle`, so no chord is further than `arcTolerance` from the arc (at most 16384 chords
  per arc). The last vertex is the end point exactly; the others lie on the circle of the start
  radius. `E` is divided evenly among the chords (proportional to arc length). `F` is a state
  change as for any move; the chords add none.
- **Flags**: every chord has `MoveFlag.Arc`, the arc command's `fileOffset` and the same
  travel/retract flags; consecutive moves with `Arc` and one `fileOffset` are one source arc, so
  a consumer can group them (a chunk boundary may fall inside an arc).
- **Invalid arcs** give the warning `arc-invalid` at the command (at most 100 per parse) and one
  straight `Arc` move to the end point: no centre in the plane, zero radius, start and end radius
  differing by more than `arcTolerance`, R too small for the chord (by more than `arcTolerance`),
  R full circle.
- A move count therefore grows with arcs: ArcWelder, Orca and Bambu "arc fitting" files, and
  the circles Bambu draws for purge lines and wipes, are cut into 15-degree-or-finer chords.

## Parsing off the calling thread

```ts
import { parseInWorker } from '@vsslicer/gcode-parser';
const ctl = new AbortController();
for await (const chunk of parseInWorker('/path/model.gcode', {
  signal: ctl.signal,
  onProgress: ({ bytesRead, total }) => {},
  memoryCapBytes: 256 << 20,
})) {
  // chunk.moves etc. are the worker's buffers, moved to this thread
}
```

`source` is a path (read in the worker) or an `AsyncIterable<Uint8Array>` (pass `total` for progress). Node `worker_threads` only; a web-worker variant is later. Options of `parse` apply too.

- **Cancel**: abort terminates the worker; the iterator rejects with the reason, no chunk after it.
- **Progress**: per chunk, monotonic; the last call has `bytesRead === total` (end of stream is 100%, even if the last chunk's `bytesRead` is lower).
- **Memory**: heap limit `memoryCapBytes` (default 256 MiB) gives `ParseWorkerError` with `code: 'memory-cap'`. The worker stays at most `maxPendingChunks` (default 2) chunks ahead of the consumer, so a slow consumer bounds buffers. Typed errors: `memory-cap`, `parse-failed` (`cause` is the worker's error), `worker-crashed`.
- A byte-stream source stuck inside its own `next()` delays an abort until it yields.

## Thumbnails, object labels, config

Read in the same pass (`src/domain/metadata.ts`). Each result is a field of the chunk where it is
complete (`thumbnails`, `objects`, `config`); `collect` gathers them into `ParsedFile`. Text only:
`.bgcode` goes through `bgcodeSource` (below); `.gcode.3mf` comes with its container card.

## .bgcode

`parse(bgcodeSource(fileSource('part.bgcode'), { onMetadata, onDiagnostic }))` decodes the binary container
(`@vsslicer/gcode-bgcode`) to its `.gcode` twin's text and parses that, so the `ParsedFile` equals the twin's.
`onMetadata` gets every metadata block (file, printer, print, slicer INI, Slicer3 JSON, thumbnails) after the
last chunk of text; `onDiagnostic` gets container problems (bad CRC, undecodable block).

- **Thumbnails**: `; thumbnail begin WxH len` (PNG), `; thumbnail_JPG begin ...`,
  `; thumbnail_QOI begin ...` up to the matching `end`, base64 decoded; magic bytes are checked
  (`89 50 4E 47`, `FF D8 FF`, `qoif`) and `len` must equal the base64 length or the byte count.
  Any other `thumbnail_XXX` leaves the marker `THUMBNAIL_XXX` and the warning `thumbnail-format`;
  bad data gives `thumbnail-invalid`, `thumbnail-length`, `thumbnail-unterminated` (a command or
  the next `begin` before `end`, or the end of the file) and `thumbnail-too-long` (16 MiB).
- **Labels**: `; printing object NAME id:ID copy N` / `; stop printing object` (PrusaSlicer, Orca,
  Bambu), Marlin `M486 S<i>` (starts object i, `S-1` ends) with `M486 A<name>` naming the current
  index (id is the index; an unnamed object is named by it), Klipper `EXCLUDE_OBJECT_DEFINE
NAME=` (label without ranges), `_START NAME=`, `_END`, Cura `;MESH:name` (`NONMESH` ends). A
  range runs from the label to the next label, the stop line or the end of the file, and empty
  ranges are dropped. `M486` and `EXCLUDE_OBJECT_*` also stay markers: the printer runs them.
- **Config**: `; <slicer>_config = begin` ... `end` (PrusaSlicer, SuperSlicer), `; CONFIG_BLOCK_START`
  ... `_END` (Orca, Bambu): `; key = value` lines, key and value split at the first `=`, the value
  verbatim (no trimming, no unquoting; `; key =` is the empty string); a command line ends a block
  left open. Cura's `;SETTING_<n> ` lines are joined, unescaped and read as JSON; the `[values]` of
  the global and extruder profiles become the map (the first value of a key wins) in the last
  chunk, or `config-invalid` if the text does not parse.

## Decisions

- **Metadata in chunks, not a separate stream.** A chunk carries the thumbnails, label ranges and
  config entries that complete in it, so a consumer needs one stream and a progress UI can show a
  thumbnail as soon as its block has been read. Ranges are global move indices, so a range closing
  in a later chunk than its moves is fine. Image buffers are in `transferList`.

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
- `G28` still leaves a `Marker`, and also homes: the named axes (X, Y, Z; all three if none, as with Prusa's `G28 W`) go to machine 0 and lose their `G92` offset (Marlin, Klipper). `E` is untouched.
- Not handled yet: `G20` inches, `M220`/`M221`
  overrides (markers).

## Golden corpus

`test/fixtures` holds the corpus (see its `PROVENANCE.md` files) and `test/golden/*.json` its
expected summary: `slicer`, `flavour`, `moveCount`, `stateChanges`, `markers`, `layerCount`,
`arcs` (G2/G3 commands and the moves they became), `roleHistogram` (extruding moves per role name, an arc counted once), `diagnostics` for text G-code, byte size and
hash for all (binary files get more when their text is decoded), plus `thumbnails` (format, size, byte count, sha256), `objects` (name, id, copy, range and move counts) and `config` (key count, sha256 of the sorted map, a few keys) and `summary` (the `readSummary` result). `pnpm golden:update` rewrites them; review
the diff. Tests count the straight move lines (arcs via the golden `arcs`), the layer-change comments and the extruding moves per role tag of every text file independently and compare. The same for the thumbnails (decoded with `Buffer`), the object names and the config key count. Cura has no fixture yet (Q9): its tags, `;MESH:` and `;SETTING_3` are unit-tested with inline samples.

## Develop

`pnpm install && pnpm lint && pnpm test && pnpm build`. The 100 MB heap test (`test/memory.test.ts`, runs with `--expose-gc`) takes about 2 s; set
`GCODE_SKIP_HEAP_TEST=1` to skip it.
