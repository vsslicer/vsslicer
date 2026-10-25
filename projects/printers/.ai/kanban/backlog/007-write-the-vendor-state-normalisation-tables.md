---
id: 7
title: Write the vendor-state normalisation tables
type: feature
priority: P0
effort: M
model: sonnet
area: [api]
story: US3
milestone: "VSS:M3"
depends_on: [4]
created: 2026-10-25
---

Tables mapping vendor state strings to the state enum, so no adapter re-invents them.

**Code:** `vsslicer/modules/printer-api/src/domain/...` (module: `printer-api`, layer: `domain`)

## Acceptance criteria

- [ ] A case per PrusaLink state (nine), Moonraker `print_stats.state` values, OctoPrint flags, Duet statuses, and every Bambu `gcode_state` found in ha-bambulab `mock_data` (MIT, fixtures with a PROVENANCE note)
- [ ] An unknown vendor string maps to `error` with the vendor string preserved, never throws
- [ ] Oracle: ha-bambulab `mock_data` and the states named in `printer-connectivity.md` section 1

## Tasks

- [ ] Copy the mock_data fixtures with provenance
- [ ] Write the tables
- [ ] Table-driven tests

## Progress

Not started.
