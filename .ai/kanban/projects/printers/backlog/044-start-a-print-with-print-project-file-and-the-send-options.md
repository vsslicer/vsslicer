---
id: 44
title: Start a print with print.project_file and the send options
type: feature
priority: P1
effort: M
model: opus
area: [bambu]
story: US10
milestone: "VSS:M3"
sprint: "VSS:SP16"
depends_on: [39, 36]
created: 2026-10-25
---

The start command: `print.project_file` with `ams_mapping`, timelapse, bed levelling, flow calibration and use-AMS options.

**Code:** `vsslicer/modules/printer/bambu/src/adapters/...` (module: `printer-bambu`, layer: `adapters`)

## Acceptance criteria

- [ ] Payload equals Orca's for the same options (golden on the fixture plate); verified against the H2C's accepted command (US14)
- [ ] Options default per the capability table; an option the model does not support is dropped with a warning

## Tasks

- [ ] Command builder
- [ ] Option handling
- [ ] Golden test

## Progress

Not started.
