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
depends_on: [5]
created: 2026-10-25
---

Module: `gcode-bgcode` (`@vsslicer/gcode-bgcode`), layer `domain`; `gcode-parser` consumes it through a semver range. Module model: `.ai/instructions.md` "Architecture rules" and D12 (independent modules in `vsslicer/modules/<name>/`, local Verdaccio registry, `scripts/run.mjs`).

Container reader ported from libbgcode@d4da907 `src/LibBGCode/core` (AGPL-3.0, provenance lines per D2).

Needs the PLT monorepo, vitest and CI (PLT:E1) before it can start; those cards belong to the platform worker.

## Acceptance criteria

- [ ] File header and the six block types parse on every PrusaSlicer `.bgcode` fixture
- [ ] CRC failure, unknown block type, unknown compression and truncated block each raise a typed diagnostic (four tests)
- [ ] Inflate uses `node:zlib` behind a codec interface (test with a fake codec)

## Tasks

- [ ] Port header and block framing
- [ ] CRC32
- [ ] Codec interface and Deflate
- [ ] Diagnostics

## Progress

Not started.
