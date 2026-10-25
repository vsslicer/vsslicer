---
id: 128
title: Offer discovered printers in Add printer
type: feature
priority: P1
effort: M
model: sonnet
area: [discovery]
story: US23
milestone: "VSS:M3"
sprint: "VSS:SP14"
depends_on: [126, 127, 21]
created: 2026-10-25
---

'Add printer' lists probed hosts from the agent, with manual entry always available.

**Code:** `vsslicer/modules/printers-extension/src/presentation/...` (module: `printers-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] A discovered host pre-fills the form; manual entry remains
- [ ] In a Remote session the list says discovery runs on the local machine and why it may be empty (test)

## Tasks

- [ ] Quick pick
- [ ] Remote explanation
- [ ] Integration test with fake discoverers

## Progress

Not started.
