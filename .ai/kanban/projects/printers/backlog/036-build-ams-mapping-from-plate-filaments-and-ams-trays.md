---
id: 36
title: Build ams_mapping from plate filaments and AMS trays
type: feature
priority: P1
effort: M
model: opus
area: [bambu]
story: US10
milestone: "VSS:M3"
sprint: "VSS:SP18"
depends_on: [32, 14]
created: 2026-10-25
---

Default a project filament to a tray by type and colour and produce the exact `ams_mapping` array the printer accepts.

**Code:** `vsslicer/modules/printer/bambu/src/domain/...` (module: `printer-bambu`, layer: `domain`)

## Acceptance criteria

- [ ] Input is a plain `PlateFilament[]` type owned by this module (no 3mf dependency here); output matches the shape Orca sends field by field (`bambu-connectivity.md` section 1) on the corpus of fixture plates
- [ ] Default mapping by type then nearest colour; user override respected; unmatched filament reported, not guessed
- [ ] The H2C accepts the produced mapping (US14)

## Tasks

- [ ] Mapping algorithm
- [ ] Shape serialiser
- [ ] Fixture and golden tests

## Progress

Not started.
