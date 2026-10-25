---
id: 60
title: "Map the inventory to and from Spoolman's export shape"
type: feature
priority: P1
effort: M
model: sonnet
area: [model, spoolman]
story: US28
milestone: "VSS:M4"
sprint: "VSS:SP18"
depends_on: [21]
created: 2026-10-25
---

Brand = vendor, Filament + Material = filament, Spool = spool, Tag = tag, superset fields in `extra`; ids kept as `external_id` pairs. Used by export here and by `filament-spoolman`.

**Code:** `vsslicer/modules/filament/src/domain/...` (module: `filament`, layer: `domain`)

## Acceptance criteria

- [ ] Export then import into an empty inventory reproduces it, superset fields surviving through `extra`
- [ ] A Spoolman `/export` fixture imports without loss of Spoolman's own fields

## Tasks

- [ ] Write the mapping both ways
- [ ] Round-trip tests

## Progress

Not started.
