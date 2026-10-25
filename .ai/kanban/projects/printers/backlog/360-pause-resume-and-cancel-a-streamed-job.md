---
id: 360
title: "Pause, resume and cancel a streamed job"
type: feature
priority: P2
effort: S
model: sonnet
area: [serial]
story: US61
milestone: "VSS:M5"
sprint: "VSS:SP31"
depends_on: [359, 352]
created: 2026-10-25
---

Pause stops feeding at a line boundary after the window drains and runs the optional pause script; resume runs the resume script and continues; cancel stops feeding, sends `M410`, then the cancel script (heater off, park) from connection settings.

**Code:** `vsslicer/modules/printer-serial/src/application/...` (module: `printer-serial`, layer: `application`)

## Acceptance criteria

- [ ] Pause then resume produces the same printed lines as an uninterrupted run (emulator)
- [ ] Cancel sends `M410` before the cancel script and never sends a line of the file afterwards
- [ ] The three scripts are optional and empty by default

## Tasks

- [ ] Pause and resume
- [ ] Cancel
- [ ] Tests

## Progress

Not started.
