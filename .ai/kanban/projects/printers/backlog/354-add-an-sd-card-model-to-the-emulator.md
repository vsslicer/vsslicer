---
id: 354
title: Add an SD card model to the emulator
type: feature
priority: P2
effort: M
model: sonnet
area: [serial]
story: US62
milestone: "VSS:M5"
sprint: "VSS:SP43"
depends_on: [353, 348]
created: 2026-10-25
---

The emulator gains `M20`/`M20 L`, `M21`, `M23`, `M24`, `M25`, `M27`, `M28`/`M29`, `M30` and `M33` with an in-memory card that can limit file-name length and refuse writes, so SD behaviour is testable without a printer.

**Code:** `vsslicer/modules/printer/serial/src/adapters/testing/` (module: `printer-serial`, layer: `adapters`)

## Acceptance criteria

- [ ] Write, list, select, start, pause and delete round trip against the model; long names are refused when the model is set to 8.3 only
- [ ] A write cut off mid-file leaves an incomplete file the test can observe
- [ ] Behaviour matches `Marlin@2ef3ee6:Marlin/src/gcode/sd/` (read, not copied) and deviations are listed in the README

## Tasks

- [ ] Card model
- [ ] SD commands
- [ ] Tests

## Progress

Not started.
