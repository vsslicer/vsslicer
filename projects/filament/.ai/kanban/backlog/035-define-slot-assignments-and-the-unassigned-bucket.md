---
id: 35
title: Define slot assignments and the unassigned bucket
type: feature
priority: P1
effort: S
model: sonnet
area: [consumption]
story: US12
milestone: "VSS:M4"
depends_on: [21]
created: 2026-10-25
---

A slot is (printer id, tool or AMS tray); an assignment points at a spool id; each printer has an `unassigned` bucket.

**Code:** `vsslicer/modules/filament/src/domain/...` (module: `filament`, layer: `domain`)

## Acceptance criteria

- [ ] Slot keys normalise a Bambu tray and a Klipper tool the same way across fixtures; the bucket is a distinct id per printer
- [ ] A spool in two slots at once is allowed and reported as a warning value, not an error

## Tasks

- [ ] Write the types
- [ ] Tests

## Progress

Not started.
