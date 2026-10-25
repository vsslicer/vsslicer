---
id: 33
title: Decode push_status into PrinterStatus with delta merging
type: feature
priority: P1
effort: M
model: opus
area: [bambu]
story: US8
milestone: "VSS:M3"
sprint: "VSS:SP10"
depends_on: [32, 14]
created: 2026-10-25
---

Map Bambu `push_status` (state, progress, temperatures, AMS trays, line number) into the normalised status and merge partial pushes.

**Code:** `vsslicer/modules/printer-bambu/src/domain/...` (module: `printer-bambu`, layer: `domain`)

## Acceptance criteria

- [ ] Delta-merge tests: partial P1-style pushes merged over a full `pushall` equal the X1-style full push (fixture pairs); no flicker or lost fields
- [ ] `gcode_state` maps through the printer-api tables; AMS trays map to `materials[]` with `remain`; H2C dual-nozzle fields from the H2C capture map to toolheads

## Tasks

- [ ] Mapper
- [ ] Merge
- [ ] Fixture-pair tests

## Progress

Not started.
