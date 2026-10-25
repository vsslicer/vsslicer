# Changelog

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
