---
id: 12
title: Port the Heatshrink 11-4 and 12-4 decoder
type: feature
priority: P0
effort: M
model: sonnet
area: [bgcode]
story: US4
milestone: "VSS:M1"
sprint: "VSS:SP2"
owner: GCP-12-worker
depends_on: [11]
created: 2026-10-25
---

Module: `gcode-bgcode`, layer `domain`. Module model: `.ai/instructions.md` "Architecture rules" and D12 (independent modules in `vsslicer/modules/<name>/`, local Verdaccio registry, `scripts/run.mjs`).

Compression used by `.bgcode` blocks, ported from libbgcode `binarize/`.

## Acceptance criteria

- [x] Vectors taken from fixtures decode to the expected bytes for 11-4 and 12-4
- [x] A corrupted stream fails with a diagnostic and terminates (timeout test)

## Tasks

- [x] Port decoder
- [x] Extract vectors from fixtures
- [x] Corruption test

## Progress

Done in `vsslicer/modules/gcode-bgcode` 0.2.0 (published to the local registry; "repository root" read as `vsslicer/`).
- `src/domain/heatshrink.ts`: whole-block decoder (window 11/12, lookahead 4), output bounded by the declared size, ported from heatshrink v0.4.1 (read via Marlin's copy, ISC notice kept); `src/adapters/heatshrink-codec.ts`: `heatshrink11Codec` (2), `heatshrink12Codec` (3).
- Vectors: both fixtures are 12-4 with MeatPack-with-comments, so no text twin exists before GCP-13. Verified instead by decoded size == declared size for every block, reference-G-code comment lines appearing verbatim in the decoded bytes, a hand-built stream, and an independent greedy encoder written in the test (round trips for 11-4 and 12-4, incl. a fixture block). Full text comparison is left to GCP-13.
- Corruption: back-reference before start, past declared size, truncated, trailing data, random junk and a huge declared size all throw promptly (timing-bounded test); reader reports `decode-failed` and continues.
- Verified: lint, test (21), build, empty-store frozen install, check-licence on the module. Registry left running.
- Files: modules/gcode-bgcode/{src/domain/heatshrink.ts, src/adapters/heatshrink-codec.ts, src/index.ts, test/heatshrink.test.ts, test/fixtures/prusaslicer/{mini_cube_b_ref.gcode,PROVENANCE.md}, package.json, pnpm-lock.yaml, pnpm-workspace.yaml, CHANGELOG.md, README.md}; .reference/notes/GCP-12-heatshrink.md.
