---
id: 13
title: Port the MeatPack decoder with and without comments
type: feature
priority: P0
effort: M
model: sonnet
area: [bgcode]
story: US4
milestone: "VSS:M1"
sprint: "VSS:SP2"
owner: GCP-13-worker
depends_on: [11]
created: 2026-10-25
---

Module: `gcode-bgcode`, layer `domain`. Module model: `.ai/instructions.md` "Architecture rules" and D12 (independent modules in `vsslicer/modules/<name>/`, local Verdaccio registry, `scripts/run.mjs`).

G-code block encoding in `.bgcode`, ported from libbgcode `binarize/`.

## Acceptance criteria

- [x] Vectors from fixtures decode with and without comment mode to the expected lines
- [x] A corrupted stream fails with a diagnostic and terminates (timeout test)

## Tasks

- [x] Port decoder
- [x] Extract vectors
- [x] Corruption test

## Progress

Done in `vsslicer/modules/gcode-bgcode` 0.3.0 (published to the local registry; "repository root" read as `vsslicer/`).
- `src/domain/meatpack.ts` `meatpackDecode` (encoding 1 and 2, libbgcode re-spacing, throws on truncated stream); `src/application/read-gcode.ts` `decodeGcodeBlocks(events)` yields `{kind:'gcode', text}` after Heatshrink then MeatPack, `decode-failed` on corrupt MeatPack.
- Tests (`test/meatpack.test.ts`): both fixtures against their reference .gcode (mini_cube_b: contiguous byte-identical; ps2.8.1: byte-identical prefix after removing 5 bare comment lines the ref lacks; see notes), encoding 1 via a test-only encoder, corrupt/garbage input (200 random streams under 5 s, decode-failed diagnostic). 29 tests, lint, build, check-licence pass; frozen install + test pass.
- Also: complete ISC text in the heatshrink header; added `mini_cube_ps2.8.1_ref.gcode` fixture (PROVENANCE updated), CHANGELOG, README.
- Not done: no encoding-1 fixture exists upstream, so that variant is tested only with a synthetic vector.
- Notes: `.reference/notes/GCP-13-meatpack.md`.
