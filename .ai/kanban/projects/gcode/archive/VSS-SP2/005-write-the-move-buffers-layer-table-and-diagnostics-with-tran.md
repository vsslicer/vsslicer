---
id: 5
title: "Write the move buffers, layer table and diagnostics with transferable output"
type: feature
priority: P0
effort: M
model: sonnet
area: [parser]
story: US1
milestone: "VSS:M1"
sprint: "VSS:SP2"
owner: GCP-5-worker
depends_on: [3, 4]
created: 2026-10-25
---

Module: `gcode-parser`, layer `domain`. Module model: `.ai/instructions.md` "Architecture rules" and D12 (independent modules in `vsslicer/modules/<name>/`, local Verdaccio registry, `scripts/run.mjs`).

Fills the SoA buffers and exposes them as transferable ArrayBuffers.

## Acceptance criteria

- [x] Buffers match the layout test from the contract card and the layer table matches golden layer counts
- [x] Diagnostics carry file offsets; each error class available so far has a test
- [x] Buffers transfer without copy (test that the source ArrayBuffer is detached)

## Tasks

- [x] Buffer writer with growth policy
- [x] Layer index table
- [x] Diagnostics collector
- [x] Transfer list helper

## Progress

Done (gcode-parser 0.4.0, published; "repository root" read as `vsslicer/`). Buffer writer, layer table and diagnostics already existed from GCP-3/4 (exact-length buffers via `slice`, growth by doubling, layers with global `firstMove`, diagnostics with `fileOffset`); this card added `collect(chunks) -> ParsedFile`, `transferList(chunk)`, tests, and the empty-final-chunk rule: the last chunk is emitted only if it holds moves, state changes, markers or diagnostics (empty file: no chunk). Documented in README and CHANGELOG.

Verified: 156 tests (new `test/transfer.test.ts`: exact lengths, `structuredClone` transfer detaches sources and the copy reads identically, no empty trailing chunk, final diagnostics carried, layer table/markers/diagnostics identical across chunk sizes, empty input), goldens unchanged, lint, build; published to local registry; empty-store `CI=true npm_config_store_dir=<tmp> pnpm install --frozen-lockfile` then lint/test/build green. Per-error-class tests: line-too-long, offset-overflow, unknown-role, unknown-extruder, no-slicer-tags already tested in earlier cards.

Files: vsslicer/modules/gcode-parser/{package.json,pnpm-lock.yaml,pnpm-workspace.yaml,CHANGELOG.md,README.md,src/index.ts,src/application/collect.ts,src/domain/transfer.ts,src/domain/parser.ts,test/streaming.test.ts,test/transfer.test.ts}; .reference/notes/GCP-5-move-buffers.md.
