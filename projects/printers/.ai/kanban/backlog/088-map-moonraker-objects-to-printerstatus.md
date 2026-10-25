---
id: 88
title: Map Moonraker objects to PrinterStatus
type: feature
priority: P0
effort: S
model: sonnet
area: [moonraker]
story: US19
milestone: "VSS:M3"
depends_on: [86, 14]
created: 2026-10-25
---

`print_stats`, `virtual_sdcard`, `heater_*`, `extruder`, `display_status` into the normalised status.

**Code:** `vsslicer/modules/printer-moonraker/src/domain/...` (module: `printer-moonraker`, layer: `domain`)

## Acceptance criteria

- [ ] Fixture snapshots map to the right state, progress, temperatures and file name; unknown state maps through the printer-api table

## Tasks

- [ ] Mapper
- [ ] Tests

## Progress

Not started.
