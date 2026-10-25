---
id: 171
title: "Add the Orca table entries: role-change hooks and timelapse"
type: feature
priority: P2
effort: S
model: sonnet
area: [orca]
story: US62
milestone: "VSS:M5"
sprint: "VSS:SP27"
depends_on: [170, 92]
created: 2026-10-25
---

Adds entries for `change_extrusion_role_gcode` and its variants, `time_lapse_gcode` and `timelapse_type`, and for SuperSlicer `feature_gcode` (renamed if the unified schema models it, else unsupported).

**Code:** `vsslicer/modules/slicer-orca/src/domain/...` (module: `slicer-orca`, layer: `domain`)

## Acceptance criteria

- [ ] The table validates and the coverage check passes
- [ ] `feature_gcode` is mapped where the catalogue models it and `unsupported` otherwise; the choice is cited from the catalogue
- [ ] Hook and timelapse keys keep their placeholder names unchanged

## Tasks

- [ ] Check the keys against the catalogue
- [ ] Write the entries
- [ ] Run the table validator and coverage check

## Progress

Not started.
