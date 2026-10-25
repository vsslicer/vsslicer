---
id: 2
title: Define the profile entity types and shared fields
type: feature
priority: P0
effort: M
model: sonnet
area: [schema]
story: US1
milestone: "VSS:M2"
sprint: "VSS:SP5"
depends_on: [1]
created: 2026-10-25
---

TypeScript types for vendor, printer_model, nozzle, surface, feeder, material, process and printer_instance per `profiles.md` §6, with the fields every entity shares.

**Code:** `vsslicer/modules/profile-api/src/domain/entities/` (module: `profile-api`, layer: `domain`)

## Acceptance criteria

- [ ] Every entity in `profiles.md` §6 has a type with its required and optional fields; shared fields `id`, `inherits[]`, `abstract`, `when`, `overrides[]` (`match: first|all`), `settings`, `renamed_from[]`, `meta` exist on all but `vendor`
- [ ] `material` carries type, diameter, density, cost and `external_ids` (cura_guid, bambu_filament_id, orca_filament_id, prusa_name)
- [ ] `printer_instance` has `toolheads[{slot, nozzle}]`, `feeder {type: mmu|ams|toolchanger, slots}` and `connection {host_type: string, url, secret_ref}`; `host_type` is a plain string here (validated in E16)
- [ ] Type-level tests (`expectTypeOf`) fail if a required field is dropped

## Tasks

- [ ] Write the entity types
- [ ] Write the settings value type (scalar, keyed per-extruder map, `null`, `{expr}` for Cura formulas)
- [ ] Add the type tests

## Progress

Not started.
