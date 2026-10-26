---
id: 232
title: Supply loaded materials from the filament inventory
type: feature
priority: P2
effort: S
model: sonnet
area: [fleet]
story: US56
milestone: "VSS:M4"
sprint: "VSS:SP35"
depends_on: [223, FIL-46]
created: 2026-10-25
---

When a printer does not report loaded materials, read the spool loaded on it from the inventory and send it as facts.

**Code:** `vsslicer/modules/printers-extension/src/presentation/...` (module: `printers-extension`, layer: `presentation`)

UNRESOLVED needs filament: a released `Inventory` API (E40) giving the spool or material loaded on a printer, and the material identity rule agreed with FIL; the planner wires the filament release card.

## Acceptance criteria

- [ ] Fixture inventory gives a material to a printer without trays; unknown stays unknown

## Tasks

- [ ] Read inventory
- [ ] Push
- [ ] Test

## Progress

Not started.
