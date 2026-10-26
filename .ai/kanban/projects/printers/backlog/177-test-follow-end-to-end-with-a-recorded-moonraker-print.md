---
id: 177
title: Test follow end to end with a recorded Moonraker print
type: chore
priority: P1
effort: M
model: sonnet
area: [daemon]
story: US34
milestone: "VSS:M3"
sprint: "VSS:SP30"
depends_on: [175, GCP-53, GCP-56, 149]
created: 2026-10-25
---

The recorded print fixture drives the preview's follow cursor.

**Code:** `vsslicer/modules/printers-extension/src/presentation/...` (module: `printers-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] A recorded Moonraker print drives the cursor to the expected move (offset to move by binary search, `gcode-viewer-simulation.md` section 7)
- [ ] A stale feed stops follow with the GCP message

## Tasks

- [ ] Fixture wiring
- [ ] Assertions

## Progress

Not started.
