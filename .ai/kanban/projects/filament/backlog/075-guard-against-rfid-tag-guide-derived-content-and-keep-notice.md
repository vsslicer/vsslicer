---
id: 75
title: Guard against RFID-Tag-Guide derived content and keep notices
type: chore
priority: P2
effort: S
model: sonnet
area: [tags]
story: US33
milestone: "VSS:M4"
sprint: "VSS:SP35"
depends_on: [73, 69]
created: 2026-10-25
---

A CI check and notices so that nothing derived from RFID-Tag-Guide (no licence) enters the module, and MIT notices for OpenPrintTag and ha-bambulab facts are present.

**Code:** `vsslicer/modules/filament/` (module: `filament`, layer: `n/a (ci)`)

## Acceptance criteria

- [ ] A CI check fails on a planted file carrying RFID-Tag-Guide key material markers and on a missing notice
- [ ] `THIRD-PARTY-NOTICES` lists OpenPrintTag and ha-bambulab (MIT) and passes PLT-12's check

## Tasks

- [ ] Write the check
- [ ] Add the notices

## Progress

Not started.
