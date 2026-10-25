---
id: 50
title: Verify booking on the H2C with assigned AMS spools
type: chore
priority: P1
effort: S
model: opus
area: [consumption]
story: US21
milestone: "VSS:M4"
sprint: "VSS:SP23"
depends_on: [49, 48]
created: 2026-10-25
---

A real print on the H2C with AMS spools assigned: grams booked to the right spools and `remain` stored per tray.

**Code:** `vsslicer/modules/filament-extension/docs/hardware-checklist.md` (module: `filament-extension`, layer: `n/a (hardware verification)`)

## Acceptance criteria

- [ ] `used_g` books to the right spools; `remain` per tray is stored (firmware version and date in the test log)
- [ ] Whether the H2C reports `remain_g` is recorded in the test log
- [ ] A cancelled print at about half way books an estimate flagged as such

## Tasks

- [ ] Assign spools
- [ ] Print and cancel
- [ ] Record the log

## Progress

Not started.
