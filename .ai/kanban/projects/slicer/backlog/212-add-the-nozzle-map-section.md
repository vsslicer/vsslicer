---
id: 212
title: Add the nozzle map section
type: feature
priority: P2
effort: S
model: sonnet
area: [multimaterial]
story: US55
milestone: "VSS:M5"
sprint: "VSS:SP44"
depends_on: [208]
created: 2026-10-25
---

Panel section for manual or automatic filament-to-nozzle grouping; in automatic mode it shows the grouping read back after a slice.

**Code:** `vsslicer/modules/slicer-extension/src/presentation/...` (module: `slicer-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] Manual map edits write `filament_map` and `filament_map_mode`
- [ ] After an automatic slice, the grouping read back is shown (stub result in the test)
- [ ] The section hides on printers with one nozzle

## Tasks

- [ ] Section UI
- [ ] Read-back display
- [ ] Tests

## Progress

Not started.
