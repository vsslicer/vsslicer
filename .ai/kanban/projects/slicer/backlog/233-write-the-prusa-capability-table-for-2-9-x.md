---
id: 233
title: Write the Prusa capability table for 2.9.x
type: feature
priority: P2
effort: M
model: sonnet
area: [prusa]
story: US68
milestone: "VSS:M5"
sprint: "VSS:SP29"
depends_on: [92, 232, 169]
created: 2026-10-25
---

Hand-maintained table: every unified key `supported`, `renamed` or `unsupported` for PrusaSlicer 2.9.x, including pressure equalizer, ramping travels and native `gcode_substitutions`.

**Code:** `vsslicer/modules/slicer-prusa/src/domain/...` (module: `slicer-prusa`, layer: `domain`)

## Acceptance criteria

- [ ] The table validates and the coverage check of `slicer-api` passes with no unreviewed entry
- [ ] `gcode_substitutions` is `supported` and marked as applied by the engine
- [ ] Each entry cites the 2.9.x config key

## Tasks

- [ ] Walk the catalogue
- [ ] Write entries
- [ ] Validate

## Progress

Not started.
