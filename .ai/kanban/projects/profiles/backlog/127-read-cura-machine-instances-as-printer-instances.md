---
id: 127
title: Read Cura machine instances as printer instances
type: feature
priority: P0
effort: M
model: sonnet
area: [importers]
story: US36
milestone: "VSS:M2"
sprint: "VSS:SP11"
depends_on: [31, 136]
created: 2026-10-25
---

Reads Cura machine instances (with `definition_changes`) into an instance entity and, where Cura stores one, a credential kept apart from the entity.

**Code:** `vsslicer/modules/profiles-cura/src/adapters/instances/` (module: `profiles-cura`, layer: `adapters`)

## Acceptance criteria

- [ ] A fixture Cura machine instance saved by the real app (version recorded) yields an instance keeping model, nozzle and host
- [ ] Any credential is returned separately; unknown host types give a diagnostic and no connection
- [ ] The source files are not modified

## Tasks

- [ ] Inspect real fixtures
- [ ] Write the reader
- [ ] Tests

## Progress

Not started.
