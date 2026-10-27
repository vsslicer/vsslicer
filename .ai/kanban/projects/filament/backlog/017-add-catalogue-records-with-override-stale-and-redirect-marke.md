---
id: 17
title: "Add catalogue records with override, stale and redirect markers"
type: feature
priority: P1
effort: M
model: sonnet
area: [import, model]
story: US8
milestone: "VSS:M4"
sprint: "VSS:SP23"
depends_on: [14]
created: 2026-10-25
---

A `CatalogueRecord` wrapping Brand, Material and Filament with source, `ofd_uuid`, `moved_from`, a per-field local override marker and a stale flag, plus the normalisation key (brand, material, name, diameter, net weight).

**Code:** `vsslicer/modules/filament/filament/src/domain/...` (module: `filament`, layer: `domain`)

## Acceptance criteria

- [ ] The normalisation key treats case, whitespace and unit spellings as equal on a fixture table
- [ ] Override markers are per field; a type test fails when a record has no source

## Tasks

- [ ] Write the types
- [ ] Write the normalisation
- [ ] Tests

## Progress

Not started.
