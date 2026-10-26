---
id: 54
title: Write native export to Cura quality_changes and definition_changes
type: feature
priority: P0
effort: M
model: sonnet
area: [export]
story: US23
milestone: "VSS:M2"
sprint: "VSS:SP11"
depends_on: [31, 136]
created: 2026-10-25
---

Writes `.inst.cfg` containers with the current `setting_version` (27).

**Code:** `vsslicer/modules/profiles-cura/src/adapters/export/cura/` (module: `profiles-cura`, layer: `adapters`)

## Acceptance criteria

- [ ] Import then export of every Cura user fixture is byte-equivalent; `setting_version` is 27 for new files
- [ ] A Cura `{expr}` value is written back as the original formula text

## Tasks

- [ ] Write the inst.cfg writer
- [ ] Round-trip tests

## Progress

Not started.
