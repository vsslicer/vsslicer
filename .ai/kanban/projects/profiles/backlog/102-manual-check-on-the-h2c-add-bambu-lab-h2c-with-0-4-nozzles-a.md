---
id: 102
title: "Manual check on the H2C: add Bambu Lab H2C with 0.4 nozzles and Bambu PLA Basic"
type: chore
priority: P0
effort: S
model: sonnet
area: [wizard]
story: US42
milestone: "VSS:M2"
sprint: "VSS:SP22"
depends_on: [99, 138, 145]
created: 2026-10-25
---

Adds the owner's printer with the wizard, resolves the default process, and records the firmware; the live connection part is the M3 card `h2c_connect`.

**Code:** `vsslicer/modules/apps/profiles/test/h2c/` notes (module: `profiles-extension`, layer: n/a (manual verification))

## Acceptance criteria

- [ ] On the owner's H2C (D5) the wizard offers `Bambu Lab H2C`, both 0.4 nozzles and Bambu PLA Basic, and the resolved process values match those shown by Bambu Studio for the same selection (screenshots or values logged)
- [ ] Firmware version and date are recorded in the test log

## Tasks

- [ ] Run the wizard
- [ ] Compare with Bambu Studio
- [ ] Record firmware

## Progress

Not started.
