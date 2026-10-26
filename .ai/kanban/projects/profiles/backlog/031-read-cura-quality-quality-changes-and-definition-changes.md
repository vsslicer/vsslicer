---
id: 31
title: "Read Cura quality, quality_changes and definition_changes"
type: feature
priority: P0
effort: M
model: sonnet
area: [importers]
story: US13
milestone: "VSS:M2"
sprint: "VSS:SP10"
depends_on: [30, 125, 135]
created: 2026-10-25
---

Quality files become `process` entities with a `when` condition from their metadata; user `quality_changes` and `definition_changes` import as user entities.

**Code:** `vsslicer/modules/profiles-cura/src/adapters/quality/` (module: `profiles-cura`, layer: `adapters`)

## Acceptance criteria

- [ ] Golden count at Cura@5bea2f8: 6 011 quality files import; each carries its definition/variant/material/quality_type as a `when`
- [ ] A fixture `quality_changes` and `definition_changes` pair imports as a user process and a printer_instance diff

## Tasks

- [ ] Read quality metadata
- [ ] Convert to `when`
- [ ] Read the user change files

## Progress

Not started.
