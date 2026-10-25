---
id: 48
title: Search materials by external id
type: feature
priority: P1
effort: S
model: sonnet
area: [store]
story: US21
milestone: "VSS:M2"
sprint: "VSS:SP8"
depends_on: [44, 135]
created: 2026-10-25
---

`findMaterialByExternalId` over Bambu `filament_id`, Orca ids, Prusa names and Cura GUIDs, for the FIL spool-to-profile link.

**Code:** `vsslicer/modules/profiles/src/application/store/` (module: `profiles`, layer: `application`)

## Acceptance criteria

- [ ] Each of the four id kinds finds the right material in a fixture store; an unknown id returns an empty result
- [ ] An id shared by two materials returns both with a diagnostic

## Tasks

- [ ] Add the index
- [ ] Tests

## Progress

Not started.
