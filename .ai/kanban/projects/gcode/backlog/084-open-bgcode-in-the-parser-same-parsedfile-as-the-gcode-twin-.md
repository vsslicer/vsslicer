---
id: 84
title: "Open .bgcode in the parser: same ParsedFile as the .gcode twin, metadata in the golden JSON"
type: feature
priority: P1
effort: M
model: sonnet
story: US4
milestone: "VSS:M1"
sprint: "VSS:SP4"
depends_on: [14]
created: 2026-10-25
---

Module: gcode-parser, layer: adapters. Split from GCP-14 (SP3 review r-wave3): gcode-bgcode 0.4.x decodes a `.bgcode` to its `.gcode` twin and exposes `BgcodeMetadata`, but the parser does not open `.bgcode` yet.

## Acceptance criteria

- [ ] Opening a `.bgcode` gives the same `ParsedFile` as its `.gcode` twin (both corpus pairs)
- [ ] All bgcode metadata blocks appear in the golden JSON
- [ ] A Slicer3 JSON-encoded block is covered (synthetic fixture until a real one exists)

## Progress

Not started.
