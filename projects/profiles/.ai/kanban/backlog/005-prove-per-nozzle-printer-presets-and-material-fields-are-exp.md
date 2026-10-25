---
id: 5
title: Prove per-nozzle printer presets and material fields are expressible
type: feature
priority: P0
effort: S
model: sonnet
area: [schema]
story: US10
milestone: "VSS:M2"
sprint: "VSS:SP5"
depends_on: [3]
created: 2026-10-25
---

Covers the two P0 matrix rows on nozzle-as-entity and filament presets with fixtures.

**Code:** `vsslicer/modules/profile-api/src/domain/entities/` tests and `vsslicer/modules/profile-api/test/fixtures/nozzle/` (module: `profile-api`, layer: `domain`)

## Acceptance criteria

- [ ] A fixture set shows a Prusa per-nozzle printer preset (0.4 and 0.6) written as `printer_model` + `nozzle` + `overrides` and validated
- [ ] A `surface` entity (Cura buildplate variant and Orca plate temperature keys) validates
- [ ] A `material` fixture carries type, diameter, density, cost, temperatures, flow and all four `external_ids`; a Cura GUID and a Bambu filament id are both stored

## Tasks

- [ ] Write the fixtures
- [ ] Write the validation tests

## Progress

Not started.
