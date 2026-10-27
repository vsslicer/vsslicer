---
id: 231
title: Push model and nozzle from the printer instance to the agent
type: feature
priority: P2
effort: S
model: sonnet
area: [fleet]
story: US56
milestone: "VSS:M4"
sprint: "VSS:SP35"
depends_on: [26, PRF-136, 223]
created: 2026-10-25
---

Resolve each printer's `printer_instance` (model, toolhead nozzles) through the existing profiles link and send `fleet.facts.set`.

**Code:** `vsslicer/modules/apps/printers/src/presentation/...` (module: `printers-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] Changing the instance updates the facts; a printer without an instance sends none

## Tasks

- [ ] Resolve
- [ ] Push
- [ ] Test

## Progress

Not started.
