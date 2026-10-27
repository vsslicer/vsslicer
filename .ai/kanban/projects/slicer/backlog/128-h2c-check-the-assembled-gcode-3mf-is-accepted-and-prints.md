---
id: 128
title: "H2C check: the assembled `.gcode.3mf` is accepted and prints"
type: chore
priority: P1
effort: S
model: opus
area: [engine]
story: US10
milestone: "VSS:M3"
sprint: "VSS:SP34"
depends_on: [54, 119, 126, PRN-60, PRN-48]
created: 2026-10-25
---

Owner-machine check (D5): one fixture plate sliced, assembled by `slicer-output` and sent to the H2C through the print task.

**Code:** `vsslicer/modules/apps/slicer/` (module: `slicer-extension`, layer: n/a (hardware verification))

## Acceptance criteria

- [ ] The H2C accepts the file and starts printing; firmware version and date recorded
- [ ] Findings feed back into the `slice_info` field table if the H2C rejected a variant
- [ ] Everything else is fixtures only

## Tasks

- [ ] Run on the owner's machine
- [ ] Record versions and result

## Progress

Not started.
