---
id: 2
title: Define the inventory entities and their validation
type: feature
priority: P1
effort: M
model: sonnet
area: [model]
story: US1
milestone: "VSS:M4"
depends_on: [1]
created: 2026-10-25
---

Brand, Material, Filament, Spool, Tag and ConsumptionEvent as immutable value objects with validation, following Spoolman's field list (MIT, `filament-management.md` sections 1 and 5) written new.

**Code:** `vsslicer/modules/filament/src/domain/...` (module: `filament`, layer: `domain`)

## Acceptance criteria

- [ ] Each entity carries the fields of E40's scope: `ofd_uuid`, `slicer_ids {bambu, orca, prusa, cura}`, `external_id`, `material_profile_id`, `last_remain_pct`, `last_remain_g`, `extra {}`; a type test fails when a field is removed
- [ ] `ConsumptionEvent.source` is one of `gcode | extrusion | ams | tag | manual | scale` with grams and an estimate flag; an unknown source is rejected
- [ ] Negative weights and an empty spool heavier than its initial weight are rejected with typed errors

## Tasks

- [ ] Write the entity types
- [ ] Write the validators
- [ ] Unit tests

## Progress

Not started.
