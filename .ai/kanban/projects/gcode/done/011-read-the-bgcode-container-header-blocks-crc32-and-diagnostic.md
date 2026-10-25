---
id: 11
title: "Read the .bgcode container: header, blocks, CRC32 and diagnostics"
type: feature
priority: P0
effort: L
model: sonnet
area: [bgcode]
story: US4
milestone: "VSS:M1"
sprint: "VSS:SP2"
owner: GCP-11-worker
depends_on: [1]
created: 2026-10-25
---

Module: `gcode-bgcode` (`@vsslicer/gcode-bgcode`), layer `domain`; `gcode-parser` consumes it through a semver range. Module model: `.ai/instructions.md` "Architecture rules" and D12 (independent modules in `vsslicer/modules/<name>/`, local Verdaccio registry, `scripts/run.mjs`).

Container reader ported from libbgcode@d4da907 `src/LibBGCode/core` (AGPL-3.0, provenance lines per D2).

Needs the PLT monorepo, vitest and CI (PLT:E1) before it can start; those cards belong to the platform worker.

## Acceptance criteria

- [x] File header and the six block types parse on every PrusaSlicer `.bgcode` fixture
- [x] CRC failure, unknown block type, unknown compression and truncated block each raise a typed diagnostic (four tests)
- [x] Inflate uses `node:zlib` behind a codec interface (test with a fake codec)

## Tasks

- [x] Port header and block framing
- [x] CRC32
- [x] Codec interface and Deflate
- [x] Diagnostics

## Progress

Done: new module `vsslicer/modules/gcode-bgcode` (`@vsslicer/gcode-bgcode` 0.1.0, published to the local registry; empty-store install, lint, build, test proven; check-licence passes). Layers: domain (header/block model, enums, CRC32, typed diagnostics), application (`readBgcode`, `Codec` port), adapters (`node:zlib` Deflate).
Verified: 8 vitest tests: both PrusaSlicer fixtures (mini_cube_ps2.8.1, mini_cube_b) parse header plus all six block types with clean CRCs; four diagnostic tests (crc-mismatch, unknown-block-type, unknown-compression, truncated); fake-codec and throwing-codec tests.
Caveat: on both fixtures the G-code block is Heatshrink (compression 3; MeatPack encoding 2 on ps2.8.1), so its `data` is undefined with an `unsupported-compression` warning until GCP-12; MeatPack decoding is GCP-13 (consumers read `params.encoding`). Unknown block type/compression stops the stream (block size unknowable).
Files: vsslicer/modules/gcode-bgcode/** (src, test, fixtures + PROVENANCE.md, README, CHANGELOG, configs); .reference/notes/GCP-11-bgcode-container.md.

Review fixes: `truncated` is now reported whenever the source ends with any buffered bytes that do not form a complete unit (root cause: partial bytes were dropped silently); only an exact block boundary or the end right after the file header ends quietly. Reader now keeps a chunk list (linear; 20 MB block in 4 KB chunks tested under 3 s, about 0.1 s in practice). Provenance copyright reworded to "Copyright (c) Prusa Research (libbgcode, AGPL-3.0; no per-file notice upstream)". New tests: cut at every byte offset of header + two blocks (one `truncated` each except boundaries), 20 MB perf. 10 tests pass; lint/build, empty-store install and check-licence pass. Version 0.1.1 published to the local registry.
