---
id: 166
title: "Extend Plate with name, lock, bed type, print sequence, spiral mode and filament maps"
type: feature
priority: P1
effort: S
model: sonnet
area: [plates, 3mf]
story: US52
milestone: "VSS:M4"
sprint: "VSS:SP27"
depends_on: [78]
created: 2026-10-25
---

Additive fields on the `Plate` type for the per-plate settings Bambu and Orca store.

**Code:** `vsslicer/modules/3mf/src/domain/project/` (module: `3mf`, layer: `domain`)

## Acceptance criteria

- [ ] Fields are optional with the Orca defaults, so existing goldens do not change
- [ ] Bed type and print sequence are closed enums with the Orca names

## Tasks

- [ ] Types
- [ ] Defaults
- [ ] Tests

## Progress

Not started.
