---
id: 3
title: Implement the streaming text parser core
type: feature
priority: P0
effort: L
model: sonnet
area: [parser]
story: US1
milestone: "VSS:M1"
sprint: "VSS:SP2"
owner: GCP-3-worker
depends_on: [1, 2, 57]
created: 2026-10-25
---

Module: `gcode-parser`, layers `domain` (tokeniser, state machine) and `application` (`parse`). Module model: `.ai/instructions.md` "Architecture rules" and D12 (independent modules in `vsslicer/modules/<name>/`, local Verdaccio registry, `scripts/run.mjs`).

Turns text G-code into moves with modal state.

## Acceptance criteria

- [x] Unit tests per command: G0/G1, G90/G91, M82/M83, G92, G10/G11, G17-19 plane state, tool changes, M104/M109/M140/M190, M106/M107, M204/M205/M201/M203/M566, M900/M572, SET_VELOCITY_LIMIT, SET_PRESSURE_ADVANCE
- [x] Interpreted modal changes fill gcode-api's state-change table (GCP-57); a decoded offset past 4 GiB emits a diagnostic instead of wrapping (test)
- [x] Unknown commands are kept as named markers (test)
- [x] The corpus move counts match golden JSON
- [x] Streams from disk by chunk; a 100 MB synthetic file never loads whole (test on heap)

## Tasks

- [x] Line tokeniser with file offsets
- [x] Modal state machine
- [x] Command handlers for the scope list
- [x] Marker for unknown commands
- [x] Wire to the corpus goldens

## Progress

Done in `vsslicer/modules/gcode-parser` (0.2.1, published to the local registry; depends on `@vsslicer/gcode-api` ^0.2.0). "Repository root" read as `vsslicer/`.

- Domain: byte-level tokeniser with file offsets, modal state machine and handlers for every command in the scope list, chunk writer (gcode-api buffers, change dedup), line splitter. Application: `parse`. Adapter: `fileSource`.
- GCP-57 decisions settled (README and notes `.reference/notes/GCP-3-parser-core.md`): only changed values stored for every kind; units per flavour option (default marlin); Klipper extruder name mapping; G4 stays a marker; G2/G3 one Arc move; 4 GiB `offset-overflow`.
- Verified: 83 tests (per-command unit tests, 1-byte input pieces, chunk bounds, abort, long line, overflow via `baseOffset`, 100 MB heap test ~2 s, mutation-checked), lint, build, dist smoke run; goldens regenerated with real `moveCount` (+ stateChanges, markers, diagnostics) and an independent line-count test matches for all 10 text files; empty-store `CI=true ... pnpm install --frozen-lockfile` then lint/test/build green.
- Not done (later cards): slicer/flavour detection, roles/widths/layers, bgcode, arc tessellation, G28 position. Registry left running.
- Files: vsslicer/modules/gcode-parser/{package.json,pnpm-lock.yaml,README.md,CHANGELOG.md,src/**,scripts/update-golden.ts,test/{commands,streaming,golden}.test.ts,test/support/{golden,run,parser-summary}.ts (interim-summary.ts removed),test/golden/**}.

Review fixes (0.2.1, published, registry still running): (1) E is relative when G91 is on or M83 was seen (PrusaSlicer GCodeProcessor.cpp ~3133; Marlin agrees for G91). M83 then G90 keeps E relative as in PrusaSlicer; Marlin would revert to absolute (documented in README and notes). Relative E moves now also advance the tracked absolute E, so a later M82 deltas stay right. Tests: M82+G91, M83+G90, G91+M82 (then G90), plain G90/G91. README "as in Marlin" claim corrected. (2) A leading UTF-8 BOM is skipped at the stream start (works split across 1-byte pieces; offsets still count the BOM); test. (3) Heap test comment now says the `arrayBuffers` assertion is what catches chunk retention; the 64 MB limit is kept. Goldens unchanged (move counts same). Verified: lint, 83 tests, build; empty-store `CI=true npm_config_store_dir=<tmp> pnpm install --frozen-lockfile` then lint/test/build green. Changed: src/domain/{machine,parser}.ts, test/{commands,streaming}.test.ts, README.md, CHANGELOG.md, package.json, `.reference/notes/GCP-3-parser-core.md`.
