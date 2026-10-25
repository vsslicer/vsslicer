---
id: US12
title: "Assign spools to printer tools and AMS trays"
status: reviewed
epic: VSS:E42
---

As a printer owner, I want each printer tool or AMS tray assigned to a spool, stored in the inventory, so that consumption lands on the right spool.

## Acceptance criteria

- [ ] Assignments are keyed by printer and tool or tray and survive restarts (rebuilt from the log)
- [ ] Assigning, moving and clearing a slot are events; a slot map is exposed through `Inventory`

## Out of scope

- Assignment UI (E43)
- Auto-assignment from tags (E44)
