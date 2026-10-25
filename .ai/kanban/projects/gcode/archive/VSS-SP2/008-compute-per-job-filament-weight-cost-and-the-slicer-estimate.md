---
id: 8
title: "Compute per-job filament, weight, cost and the slicer estimate; add readSummary"
type: feature
priority: P0
effort: M
model: sonnet
area: [parser]
story: US2
milestone: "VSS:M1"
sprint: "VSS:SP2"
owner: GCP-8-worker
depends_on: [7]
created: 2026-10-25
---

Module: `gcode-parser`, layers `domain` and `application` (`readSummary`). Module model: `.ai/instructions.md` "Architecture rules" and D12 (independent modules in `vsslicer/modules/<name>/`, local Verdaccio registry, `scripts/run.mjs`).

Gives FIL consumption booking, SLC output checks and the viewer the statistics without moves.

## Acceptance criteria

- [x] Summary matches the slicer's own summary comments (or `slice_info.config`) per extruder on every fixture
- [x] `readSummary(uri)` returns the statistics without allocating move buffers (test)
- [x] Missing statistics yield absent fields, not zeros (test)

## Tasks

- [x] Read per-slicer summary comments
- [x] Implement `readSummary`
- [x] Per-extruder tests against goldens

## Progress

Done. `JobSummary` (`ExtruderUsage`, `EstimateSeconds`) in `gcode-api` 0.4.0; `readSummary(source)` (application), `readSummaryFile(path)` (adapter, first and last 512 KiB), `SummaryBuilder` (domain) in `gcode-parser` 0.7.0. Both published to the local registry; empty-store `pnpm install --frozen-lockfile` passes for both.

- Per-extruder length, volume, weight, cost and time estimates (normal, silent, model, total) from PrusaSlicer, Orca, Bambu Studio and Cura comments; totals come from these, not from E (README wording aligned). Bambu Studio's mm3 volume is converted, its `weight 0.00` (no density) is dropped. `slice_info.config` (.gcode.3mf) not read: no fixture (Q10).
- Verified: goldens gain `summary`; `test/summary.test.ts` cross-checks every fixture against an independent read of the raw lines; absent-not-zero tests; a 100 MB stream scan grows arrayBuffers by under 2 MB (no move buffers) and is under 5 s; the file reader equals the full scan on the corpus (under 1 s total).
- Flaky heap test: moved to `test/memory.test.ts` with `--expose-gc` (vitest `execArgv`), GC before baseline and before each measurement; retention assertion kept. Passed 10/10 consecutive runs.
- Caveat: another worker's `test/fixtures/bambu-studio/h2c-cube.3mf` (not in manifest) makes golden test "manifest and fixture folders list the same files" fail in the full suite until its owner adds the entry; 236/237 otherwise.
- Files (vsslicer/modules/): gcode-api/{src/domain/parsed-file.ts,src/index.ts,test/types.test.ts,package.json,CHANGELOG.md,README.md}; gcode-parser/{src/domain/summary.ts,src/application/read-summary.ts,src/adapters/summary-file.ts,src/index.ts,test/summary.test.ts,test/memory.test.ts,test/streaming.test.ts,test/support/parser-summary.ts,test/golden/**/*.json,vitest.config.ts,package.json,pnpm-lock.yaml,CHANGELOG.md,README.md}; .reference/notes/GCP-8-summary.md.
