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
depends_on: [11]
created: 2026-10-25
---

Module: `gcode-bgcode`, layer `domain`. Module model: `.ai/instructions.md` "Architecture rules" and D12 (independent modules in `vsslicer/modules/<name>/`, local Verdaccio registry, `scripts/run.mjs`).

G-code block encoding in `.bgcode`, ported from libbgcode `binarize/`.

## Acceptance criteria

- [ ] Vectors from fixtures decode with and without comment mode to the expected lines
- [ ] A corrupted stream fails with a diagnostic and terminates (timeout test)

## Tasks

- [ ] Port decoder
- [ ] Extract vectors
- [ ] Corruption test

## Progress

Not started.
