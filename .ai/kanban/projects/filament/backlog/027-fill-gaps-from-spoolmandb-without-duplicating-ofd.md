---
id: 27
title: Fill gaps from SpoolmanDB without duplicating OFD
type: feature
priority: P1
effort: M
model: sonnet
area: [import]
story: US9
milestone: "VSS:M4"
sprint: "VSS:SP23"
depends_on: [26]
created: 2026-10-25
---

SpoolmanDB `filaments.json` as a secondary source: add an entry only when no OFD record matches by EAN, else by normalised key; record every match.

**Code:** `vsslicer/modules/filament/ofd/src/domain/...` (module: `filament-ofd`, layer: `domain`)

## Acceptance criteria

- [ ] An entry duplicating an OFD record by EAN or by normalised key is not added; a unique entry is
- [ ] Every match decision is listed in the report (nothing merged silently)

## Tasks

- [ ] Write the matcher
- [ ] Tests on the fixtures

## Progress

Not started.
