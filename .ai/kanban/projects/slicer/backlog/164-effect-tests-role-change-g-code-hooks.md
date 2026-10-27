---
id: 164
title: "Effect tests: role-change G-code hooks"
type: chore
priority: P2
effort: S
model: sonnet
area: [engine]
story: US62
milestone: "VSS:M5"
sprint: "VSS:SP39"
depends_on: [87, 159, GCP-4]
created: 2026-10-25
---

Effect test for `change_extrusion_role_gcode` and its process and filament variants: the hook text appears at role changes only.

**Code:** `vsslicer/modules/common/slicer-api/` (module: `slicer-api`, layer: n/a (testkit))

## Acceptance criteria

- [ ] The hook text appears at every role change of the fixture and nowhere else
- [ ] The process-level and filament-level variants both pass through
- [ ] SuperSlicer `feature_gcode` has an assertion that its entry is `unsupported` or `renamed` as the table says

## Tasks

- [ ] Define the test
- [ ] Role change helper
- [ ] Canned G-code tests

## Progress

Not started.
