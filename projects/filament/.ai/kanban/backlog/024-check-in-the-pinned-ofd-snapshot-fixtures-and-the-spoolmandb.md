---
id: 24
title: Check in the pinned OFD snapshot fixtures and the SpoolmanDB sample
type: chore
priority: P1
effort: S
model: sonnet
area: [import]
story: US7
milestone: "VSS:M4"
sprint: "VSS:SP17"
depends_on: [23]
created: 2026-10-25
---

A trimmed OFD snapshot at two revisions (recorded commit and date), its JSON Schema and a trimmed SpoolmanDB `filaments.json`, each with a PROVENANCE note.

**Code:** `vsslicer/modules/filament-ofd/test/fixtures/` (module: `filament-ofd`, layer: `n/a (fixtures)`)

## Acceptance criteria

- [ ] Two snapshot revisions with a recorded commit and date; the Bambu PLA sample with `GFA16` and generic `GFL99` is included; the second revision changes, moves (`moved_from`) and deletes records
- [ ] The SpoolmanDB sample includes one entry duplicating an OFD record by EAN, one by normalised key and one unique
- [ ] MIT licence notices for both sources sit next to the fixtures

## Tasks

- [ ] Select and trim records
- [ ] Write PROVENANCE
- [ ] Add notices

## Progress

Not started.
