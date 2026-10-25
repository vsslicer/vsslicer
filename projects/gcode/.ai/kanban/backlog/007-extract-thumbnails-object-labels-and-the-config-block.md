---
id: 7
title: "Extract thumbnails, object labels and the config block"
type: feature
priority: P0
effort: M
model: sonnet
area: [parser]
story: US2
milestone: "VSS:M1"
sprint: "VSS:SP2"
depends_on: [5]
created: 2026-10-25
---

Module: `gcode-parser`, layer `domain`. Module model: `.ai/instructions.md` "Architecture rules" and D12 (independent modules in `vsslicer/modules/<name>/`, local Verdaccio registry, `scripts/run.mjs`).

Thumbnails, labels and config share the same pass as the moves.

## Acceptance criteria

- [ ] PNG, JPG and QOI thumbnails and the Prusa comment form are extracted; other formats leave a marker (tests on corpus)
- [ ] Labels from `; printing object`, M486, `EXCLUDE_OBJECT_*` and Cura `;MESH:` match golden JSON
- [ ] The config block is exposed as a key-value map matching the golden JSON

## Tasks

- [ ] Thumbnail block parser
- [ ] Label parsers for all forms
- [ ] Config block reader
- [ ] Golden updates

## Progress

Not started.
