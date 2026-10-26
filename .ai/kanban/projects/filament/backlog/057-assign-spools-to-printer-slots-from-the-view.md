---
id: 57
title: Assign spools to printer slots from the view
type: feature
priority: P1
effort: M
model: sonnet
area: [ui]
story: US26
milestone: "VSS:M4"
sprint: "VSS:SP34"
depends_on: [52, 46, PRN-28]
created: 2026-10-25
---

Commands and tree actions to set the spool in a printer tool or AMS tray (printers from `PrinterRegistry`), clear it, and resolve unassigned-bucket entries.

**Code:** `vsslicer/modules/filament-extension/src/presentation/...` (module: `filament-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] Assign, move and clear from the tree on the fake printer adapter's slots (integration test)
- [ ] An unassigned-bucket entry shows "Assign" and moves the usage to the chosen spool

## Tasks

- [ ] Commands
- [ ] Tree actions
- [ ] Integration test

## Progress

Not started.
