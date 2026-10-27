---
id: 194
title: "H2C: print the temperature tower, a flow test and a PA test and record the firmware"
type: chore
priority: P2
effort: M
model: opus
area: [tasks, calibration]
story: US50
milestone: "VSS:M5"
sprint: "VSS:SP42"
depends_on: [193, 128, PRN-60]
created: 2026-10-25
---

Hardware verification on the owner's H2C: one print of each test through the Calibration command and the send path (D5).

**Code:** `vsslicer/modules/apps/slicer/` (module: `slicer-extension`, layer: n/a (hardware verification))

## Acceptance criteria

- [ ] One temperature tower, one flow test and one PA test printed; the firmware version and Orca version are recorded in the note
- [ ] The parser-detected sweep matches the printed blocks on the tower
- [ ] The written values are applied to a user preset and the diff matches the picked block

## Tasks

- [ ] Run the three prints
- [ ] Record firmware and results
- [ ] Note divergences

## Progress

Not started.
