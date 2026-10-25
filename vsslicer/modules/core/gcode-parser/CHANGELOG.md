# Changelog

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
