---
id: 125
title: Convert Cura quality metadata and exclude_materials to unified conditions
type: feature
priority: P0
effort: S
model: sonnet
area: [evaluator]
story: US3
milestone: "VSS:M2"
depends_on: [121, 135]
created: 2026-10-25
---

The Cura rows of the §6 conversion table: quality metadata `definition`/`variant`/`material`/`quality_type` and `exclude_materials`.

**Code:** `vsslicer/modules/profiles-cura/src/adapters/conditions/` (module: `profiles-cura`, layer: `adapters`)

## Acceptance criteria

- [ ] Quality metadata converts to `printer.model == X and nozzle.id == '..' and material.base == '..'`; `exclude_materials` to `material.base not in [...]`
- [ ] Every output parses and evaluates with the `profile-api` parser (release 0.1.0)

## Tasks

- [ ] Write the converters
- [ ] Write the tests

## Progress

Not started.
