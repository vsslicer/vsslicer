---
id: 80
title: "Two-extruder fixture: support and adhesion come from the limited extruder"
type: chore
priority: P1
effort: S
model: sonnet
area: [cura]
story: US14
milestone: "VSS:M3"
sprint: "VSS:SP17"
depends_on: [78, GCP-3]
created: 2026-10-25
---

Regression for the engine path of `limit_to_extruder`.

**Code:** `vsslicer/modules/slicer-cura/` (module: `slicer-cura`, layer: n/a (integration tests))

## Acceptance criteria

- [ ] In the sliced output the support layers use the limited extruder's temperature and tool (read by `@vsslicer/gcode`)
- [ ] The test fails if the other extruder's values leak into support layers

## Tasks

- [ ] Fixture
- [ ] Assertions on tool and temperature

## Progress

Not started.
