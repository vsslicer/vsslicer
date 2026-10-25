---
id: US1
title: "Model spools, filaments and weights correctly"
status: reviewed
epic: VSS:E40
---

As a module author, I want Brand, Material, Filament, Spool, Tag and ConsumptionEvent entities with grams as the canonical unit and a length-to-grams conversion that refuses to guess a density, so that every other module books and reads the same numbers.

## Acceptance criteria

- [ ] Entities carry the fields of the Spoolman-compatible superset, including `ofd_uuid`, `slicer_ids {bambu, orca, prusa, cura}`, `external_id`, `material_profile_id` and `extra {}`
- [ ] Length to grams matches Spoolman's `use_length` conversion on a fixture table; a missing density raises a typed error
- [ ] Event ids are a stable hash of source, printer, job, spool and tool

## Out of scope

- Persistence, UI and printers
