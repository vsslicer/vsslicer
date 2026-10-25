---
id: 14
title: Decode .bgcode to its .gcode twin and expose metadata blocks
type: feature
priority: P0
effort: M
model: sonnet
area: [bgcode]
story: US4
milestone: "VSS:M1"
sprint: "VSS:SP3"
depends_on: [12, 13, 4]
created: 2026-10-25
---

Makes `.bgcode` open exactly like text G-code.

## Acceptance criteria

- [x] Decoded G-code equals the `.gcode` twin line for line on every twin pair (test)
- [ ] All metadata blocks including the Slicer3 JSON block are exposed and in the golden JSON
- [ ] The same `ParsedFile` results from either file

## Tasks

- [x] Block-to-parser stream adapter
- [x] Metadata exposure
- [x] Twin comparison test

## Progress

Published `@vsslicer/gcode-bgcode@0.4.0`: `bgcodeToGcode` (text twin + final metadata event), JSON slicer block accepted. Twin test passes line for line on both fixtures. Left open: golden-JSON integration and "same ParsedFile from either file" need gcode-parser (off limits here); no fixture has a Slicer3 JSON block (synthetic test only).
