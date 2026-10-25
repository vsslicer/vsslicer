---
id: 20
title: Fill the 56 mapped keys of profiles.md section 6 with conversions and tests
type: feature
priority: P0
effort: M
model: sonnet
area: [schema]
story: US9
milestone: "VSS:M2"
sprint: "VSS:SP7"
depends_on: [13, 18]
created: 2026-10-25
---

Attaches the catalogue conversions for the 56 keys of the §6 table (90-x support angle, Cura flow x100, elephant-foot sign flip, per-plate bed temperatures) and tests each way.

**Code:** `vsslicer/modules/profile-api/src/domain/catalogue/mappings/` (module: `profile-api`, layer: `domain`)

## Acceptance criteria

- [ ] All 56 keys convert native to unified and back for Prusa, Orca/Bambu and Cura with the notes of the table as unit tests
- [ ] `support_angle` converts 90-x between Prusa/Orca and Cura; `flow_ratio` scales x100 for Cura; `elephant_foot` flips sign for Cura; `bed_temp` maps the five Orca plate keys
- [ ] A lossy mapping is flagged with the note text

## Tasks

- [ ] Write the mapping table
- [ ] Write the per-key tests

## Progress

Not started.
