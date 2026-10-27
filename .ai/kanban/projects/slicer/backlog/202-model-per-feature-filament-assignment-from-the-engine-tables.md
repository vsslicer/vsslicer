---
id: 202
title: Model per-feature filament assignment from the engine tables
type: feature
priority: P2
effort: M
model: sonnet
area: [multimaterial]
story: US54
milestone: "VSS:M5"
sprint: "VSS:SP42"
depends_on: [195, 92, 95, 99]
created: 2026-10-25
---

Lists the features an engine can assign (from its capability table) and maps an assignment to the engine's keys: Orca `*_filament_id`, Cura support and adhesion extruder settings.

**Code:** `vsslicer/modules/core/multimaterial/src/domain/...` (module: `multimaterial`, layer: `domain`)

## Acceptance criteria

- [ ] For each engine the assignable features come from the table, not a copy; a table without them gives an empty list and a reason
- [ ] An assignment to a filament index beyond the filament count is refused
- [ ] Assignment to the same filament as the default removes the override

## Tasks

- [ ] Read the table entries
- [ ] Assignment model
- [ ] Key mapping
- [ ] Tests

## Progress

Not started.
