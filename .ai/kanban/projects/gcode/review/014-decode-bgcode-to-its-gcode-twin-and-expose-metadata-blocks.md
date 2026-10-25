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
- [x] All metadata blocks are exposed (`BgcodeMetadata`); no real fixture has a Slicer3 JSON block yet (synthetic test only)
- [ ] ~~in the golden JSON~~ moved to a follow-up card on gcode-parser
- [ ] ~~The same `ParsedFile` results from either file~~ moved to a follow-up card on gcode-parser

## Tasks

- [x] Block-to-parser stream adapter
- [x] Metadata exposure
- [x] Twin comparison test

## Progress

Published `@vsslicer/gcode-bgcode@0.4.0`: `bgcodeToGcode` (text twin + final metadata event), JSON slicer block accepted. Twin test passes line for line on both fixtures. Left open: golden-JSON integration and "same ParsedFile from either file" need gcode-parser (off limits here); no fixture has a Slicer3 JSON block (synthetic test only).

0.4.1 (review fix): last line of a block without trailing newline is kept (`dropBlankLines`), thumbnail checks use `BlockType.Thumbnail`; card narrowed to bgcode-only criteria.
