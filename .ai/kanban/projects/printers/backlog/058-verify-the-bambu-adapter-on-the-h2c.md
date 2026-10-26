---
id: 58
title: Verify the Bambu adapter on the H2C
type: chore
priority: P1
effort: M
model: opus
area: [bambu]
story: US14
milestone: "VSS:M3"
sprint: "VSS:SP29"
depends_on: [52, 53, 54, 56, 48]
created: 2026-10-25
---

Hardware verification by the owner per D5: the H2C is the only printer. Result recorded in the capability table.

**Code:** `vsslicer/modules/bambu-extension/docs/h2c-checklist.md` (module: `bambu-extension`, layer: `n/a (fixtures)`)

## Acceptance criteria

- [ ] On the H2C (firmware version and date recorded): connect, status, HMS, send a sliced two-colour `.gcode.3mf` with AMS mapping and see the mapped trays in use, pause, resume, stop
- [ ] With Developer Mode off: read-only status or a recorded failure mode; Mode B opens Bambu Connect (owner checklist)
- [ ] Any mismatch with the fixtures becomes a bug card; fixtures updated from the session

## Tasks

- [ ] Prepare checklist
- [ ] Run with the owner
- [ ] Record results

## Progress

Not started.
