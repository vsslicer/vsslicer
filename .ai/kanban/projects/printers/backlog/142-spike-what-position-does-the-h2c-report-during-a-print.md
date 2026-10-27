---
id: 142
title: "Spike: what position does the H2C report during a print"
type: spike
priority: P1
effort: S
model: opus
area: [bambu]
story: US33
milestone: "VSS:M3"
sprint: "VSS:SP21"
depends_on: [30, 45, GCP-49]
created: 2026-10-25
---

Half-day H2C spike: does `mc_print_line_number` map to a byte offset of the G-code inside the `.gcode.3mf`, or is percent the only precision? Confirms the position shape with GCP-49.

**Code:** `vsslicer/modules/printer/bambu/src/adapters/...` (module: `printer-bambu`, layer: `adapters`)

## Acceptance criteria

- [ ] A note with the H2C firmware records the fields seen, their update rate and the decision: follow by line number (the preview indexes lines) or by percent only
- [ ] The decision is recorded on the VSS board if it changes the position type

## Tasks

- [ ] Capture a print
- [ ] Compare with the plate G-code
- [ ] Write the note

## Progress

Not started.
