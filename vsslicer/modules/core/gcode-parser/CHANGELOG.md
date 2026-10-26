# Changelog

## 0.13.0

- GCP-111: the `.gcode.3mf` readers (`gcode3mfSource`, `gcode3mfEntries`, `gcode3mfPlates`, `readGcode3mfPlate`, `CorruptZipError`, `SizeCapExceededError`) move to the `@vsslicer/gcode-parser/gcode-3mf` entry, so the main entry no longer loads @vsslicer/3mf (breaking for importers of those names from the main entry, which 0.12.0 added an hour earlier).

## 0.12.0

- GCP-16: `gcode3mfPlates` and `readGcode3mfPlate`: plate enumeration, `slice_info.config` statistics (linear quote-aware scanner, 4 MiB cap), the plate thumbnail and the `plate_N.gcode.md5` check for `.gcode.3mf`.
- GCP-15: `gcode3mfSource` and `gcode3mfEntries` read `.gcode.3mf` entries through @vsslicer/3mf ^0.1.0 (stored, deflated, data descriptors, zip64; typed `CorruptZipError` and `SizeCapExceededError`); the archive and entry are held in memory for now.
- GCP-99: flavour names come from gcode-api 0.7.0's `flavourFromName` (depends on ^0.7.0); Cura's `;FLAVOR:RepRap` is RepRapFirmware, not Marlin, so its `M203` limits and units follow RepRapFirmware.
- GCP-105: chunks and `collect()` use gcode-api's `Chunk` and `ParsedFile` `flavourName` directly (the `NamedChunk` shortcut is gone).

## 0.11.0

- Depends on gcode-api ^0.6.0 and gcode-bgcode ^0.4.3.
- GCP-95: `bgcodeSource` passes the decoded-text offset reached as a second argument to `onDiagnostic`.
- GCP-89: the parser fills `flavourName` on chunks and on `collect`'s `ParsedFile` with the last flavour name the file states (`;FLAVOR:` or `; gcode_flavor =`); the `flavour` option does not change it.

## 0.10.1

- GCP-18: `pnpm bench` (not part of `pnpm test`) generates seeded synthetic 50, 200 and 500 MB files (`straight`, about 34k moves/MB; `arc-heavy`, about 58k moves/MB) in a temp dir, parses each in its own process and fails on a move record over 28 B, a peak RSS over budget or a throughput under budget (`bench/budget.json`, with the machine it was measured on; `--update` re-records it, `--sizes 50,200` limits the run). Dev tooling only; nothing shipped changes.
- GCP-79: corpus gains PrusaSlicer 2.9.0-alpha1 `test_arcs_ps2.9.0-alpha1.gcode` (MINI, 10,808 arc-fitted G2/G3 lines, 3.7 MB, upstream), covered by the GCP-10 arc checks. Test fixtures only; nothing shipped changes. The other GCP-79 samples (PrusaSlicer 20 mm cube and MMU, SuperSlicer cube and MMU, Cura MMU, Bambu MMU) still need the slicers or owner GUI exports.

## 0.10.0

- GCP-84: `bgcodeSource(bytes, { onMetadata, onDiagnostic })` turns a `.bgcode` byte stream into its `.gcode` twin's text for `parse`, so a `.bgcode` gives the same `ParsedFile` as the twin. Metadata blocks (and the Slicer3 JSON one) come through `onMetadata`. New dependency `@vsslicer/gcode-bgcode` ^0.4.2. Corpus: the `.bgcode` goldens carry every metadata block; second twin pair `mini_cube_b` (PrusaSlicer 2.6.0) and the converter-written twin of the 2.8.1 file.

## 0.9.0

- GCP-83: `G4` markers carry `seconds`, the dwell as the flavour reads it (Marlin and RRF: `S` seconds over `P` ms; Klipper: `P` only; none or negative: 0). A whole-line `; ESTIMATOR_ADD_TIME <seconds> [label]` comment becomes an `ESTIMATOR_ADD_TIME` marker with `seconds` (finite and >= 0, else ignored). Needs `@vsslicer/gcode-api` ^0.5.0.

## 0.8.5

- Re-lock to gcode-api 0.4.1 (PLT-180 follow-up).

## 0.8.4

- Fix (GCP-81): the summary `extruders` array is dense. A slot whose values are all unparseable (`; filament used [mm] = nan, 120.5`, `= 1,,3`) is `{}` instead of a hole (`undefined`, `null` in JSON), so `for (const e of extruders)` no longer throws.
- Fix (GCP-80): the 100 MB summary test keeps its memory assertion and its time bound is now 30 s (a regression guard, not a benchmark); the worker corpus test has an explicit 60 s timeout. Both failed on a loaded machine. Tests only.

## 0.8.3

- Fix: `G28` now homes the toolhead position. The named axes (X, Y, Z; all three when none is named, also for Prusa's `G28 W`) go to machine 0 and lose their `G92` offset, so `G1 X50`, `G28`, `G91`, `G1 X10` ends at X10 (was X60). `E` is unchanged and `G28` still leaves its `Marker`. Positions after a `G28` in files that home mid-file change.

## 0.8.2

- Fix: 0.8.1 shipped a stale build (its `dist` predated the `collect` fix); use 0.8.2. New `prepack` script runs `pnpm build`, so `pnpm pack` and `pnpm publish` always pack a fresh `dist`.

## 0.8.1

- Fix: `collect` threw "Maximum call stack size exceeded" on a chunk with a few hundred thousand markers (a 4 MB file of 840,000 `M400` lines): it joined layers, markers, diagnostics, thumbnails and object ranges with `push(...array)`, which passes every item as an argument. They are now appended in a loop. Regression tests: 300,000 marker lines through `parse` + `collect`, and a chunk with 1,000,000 markers and object ranges.

## 0.8.0

- G2/G3 arcs are tessellated (domain `tessellateArc`, wired into the machine): I/J/K and R forms, planes G17/G18/G19 with helical interpolation, negative R, full circles, `E` split evenly. Chords stay within the new option `arcTolerance` (mm, default 0.05) of the arc and sweep at most `arcMaxAngle` (degrees, default 15). Every chord keeps `MoveFlag.Arc` and the arc command's `fileOffset`.
- New warning `arc-invalid` (and a straight move to the end point) for a missing centre, zero radius, start/end radius mismatch, R too small for the chord and an R full circle.
- Breaking for move counts: files with arcs have more moves; goldens regenerated (golden JSON gains `arcs`; `roleHistogram` still counts an arc once).
- SuperSlicer role names: `Internal perimeter`, `Internal bridge infill`, `Thin wall`, `Milling` (the 2.3.56 fixture no longer gets `unknown-role`); its role/layer line scans now run in the tests.

## 0.7.0

- `readSummary(source)` (application) and `readSummaryFile(path)` (adapter): the slicer's own job statistics as a `JobSummary` (`@vsslicer/gcode-api` 0.4.0): per extruder filament length, volume, weight and cost, and the time estimates (`normal`, `silent`, `model`, `total`), read from the summary comments of PrusaSlicer, Orca, Bambu Studio and Cura. No moves are parsed and no move buffers allocated; `readSummaryFile` reads only the first and last 512 KiB. Statistics the slicer did not state are absent; a weight, volume or cost of 0 for a filament that was fed (Bambu Studio without density) is dropped.
- Totals come from these comments, not from summing the extrusion column.
- Golden JSON gains `summary`; tests cross-check it against the raw comment lines of every fixture.
- Fix: the 100 MB heap test moved to `test/memory.test.ts` and runs with `--expose-gc`, collecting before the baseline and before each measurement, so it no longer fails on a loaded machine (GC timing). The `arrayBuffers` retention assertion stays.
- Depends on `@vsslicer/gcode-api` ^0.4.0. Dev: `@vsslicer/tooling` ^0.8.1.

## 0.6.0

- Thumbnails (PNG, JPG, QOI; unknown formats leave a marker and `thumbnail-format`), object labels (`; printing object`, `M486`, `EXCLUDE_OBJECT_*`, Cura `;MESH:`) as move ranges, and the config block (PrusaSlicer, Orca/Bambu, Cura `;SETTING_3`) as a key-value map: `Chunk.thumbnails` / `objects` / `config`, gathered by `collect` into `ParsedFile`. `transferList` includes the thumbnail buffers.
- Golden JSON gains `thumbnails`, `objects` and `config` per text file; tests cross-check them against an independent read of the fixtures.
- Depends on `@vsslicer/gcode-api` ^0.3.0.

## 0.5.1

- Fix: `parseInWorker` with a path that cannot be stat'ed (missing, no permission) now rejects with `ParseWorkerError` code `parse-failed` and the fs error as `cause` (`cause.code === 'ENOENT'`), like every other failure; before it leaked the raw fs error. Tests for ENOENT, EACCES (unreadable file) and EISDIR.

## 0.5.0

- `parseInWorker(source, { signal, onProgress, memoryCapBytes, maxPendingChunks, total, ...parserOptions })`: runs the parser in a `worker_threads` worker (`dist/adapters/worker-entry.js`) and yields the same chunks as `parse`, buffers moved by transfer. `source` is a file path (read in the worker) or a byte stream (forwarded piece by piece on request). The host thread never parses.
- Cancel: aborting terminates the worker at once and rejects with the signal's reason; no chunk follows. Tested on a 200 MB file (well under 500 ms).
- Progress: `onProgress({ bytesRead, total })` per chunk, never decreasing; the last call is `total` (file size, or the `total` option for streams).
- Memory: the worker's heap is limited to `memoryCapBytes` (default 256 MiB); exceeding it rejects with `ParseWorkerError` code `memory-cap`. Credit-based flow control keeps the worker at most `maxPendingChunks` (default 2) chunks ahead of a slow consumer. Other failures: `parse-failed` (the worker's error as `cause`), `worker-crashed`.
- Fix: `line-too-long` (over 1 MiB) is now detected whatever the input piece size (before, only when the over-length part arrived in a piece without a line break, so 64 KiB pieces or one 2 MB piece missed it).
- Dev: `@vsslicer/tooling` ^0.8.0.

## 0.4.0

- `collect(chunks) -> Promise<ParsedFile>`: joins a chunk stream into a `ParsedFile` (buffers stay one per chunk; layer table, markers and diagnostics in file order).
- `transferList(chunk)`: the chunk's three buffers for `postMessage` / `structuredClone` transfer. Buffers are exact length and detach on transfer; tests cover both.
- Change: the final chunk is no longer emitted empty. It exists only if it holds moves, state changes, markers or diagnostics (for example the end-of-file `no-slicer-tags`); an empty file yields no chunk. `bytesRead` of the last chunk may therefore be below the file size when trailing lines produce nothing.
- Dev: `@vsslicer/tooling` ^0.7.0.

## 0.3.0

- Slicer detection (`Chunk.slicer`: PrusaSlicer, SuperSlicer, OrcaSlicer, Bambu Studio, Cura) and flavour detection (`; gcode_flavor =`, Cura `;FLAVOR:`) from header and config comments. The `flavour` option is now an override: option, else detected, else `marlin`.
- Roles: `;TYPE:` and `; FEATURE:` names (PrusaSlicer, Orca, Bambu, Cura tables, ported with provenance) are written into each move's `role`; untagged files and unknown names give `Unknown` (`unknown-role` warning per distinct name).
- Layers: `;LAYER_CHANGE`, `; CHANGE_LAYER`, `;LAYER:` fill `Chunk.layers` (`z` from `;Z:` / `; Z_HEIGHT:` or the first extrusion).
- A file with moves but no role or layer tags gets one `no-slicer-tags` info diagnostic.
- Goldens gain `slicer`, `flavour`, `layerCount`, `roleHistogram`.
- Dev: `@vsslicer/tooling` ^0.6.0.

## 0.2.1

- Fix: G91 makes E relative whatever an earlier M82 said (PrusaSlicer rule); M83 stays relative under G90 (Marlin would revert to absolute).
- Fix: a leading UTF-8 BOM no longer drops the first line.
- Test: the 100 MB heap test documents that the `arrayBuffers` assertion is what catches chunk retention.

## 0.2.0

- Streaming parser core: `parse` (implements `@vsslicer/gcode-api` 0.2.0 `Parse`) and `fileSource`. Byte-level tokeniser with file offsets, modal state machine (G0-G3, G10/G11, G17-19, G90/G91, M82/M83, G92, T), state-change table (F, M104/M109/M140/M190, M106/M107, M201/M203/M204/M205/M566, M900/M572, SET_VELOCITY_LIMIT, SET_PRESSURE_ADVANCE), unknown commands as markers, `offset-overflow` past 4 GiB.
- Options `flavour`, `chunkMoves`, `chunkBytes`, `baseOffset`.
- Golden JSON now holds the real `moveCount`, `stateChanges`, `markers`, `diagnostics` (the interim line-scan fields are gone).
- Depends on `@vsslicer/gcode-api` ^0.2.0.

## 0.1.0

- Golden corpus under `test/fixtures` (OrcaSlicer, Bambu Studio, PrusaSlicer) with `manifest.json` and a `PROVENANCE.md` per folder; `scripts/slice-fixtures.sh` regenerates the Orca and Bambu Studio files.
- Golden-JSON harness: `test/golden/<file>.json` per corpus file, compared by `pnpm test`, rewritten by `pnpm golden:update`. Interim fields until the parser exists.
- The package exports nothing yet.
