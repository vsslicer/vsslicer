---
id: 59
title: Implement the Cura helper functions
type: feature
priority: P1
effort: M
model: opus
area: [cura]
story: US13
milestone: "VSS:M3"
sprint: "VSS:SP21"
depends_on: [58]
created: 2026-10-25
---

`resolveOrValue`, `extruderValue`, `extruderValues`, `anyExtruderWithMaterial`, `defaultExtruderPosition` and the others in the survey, with Uranium/Cura semantics for missing extruders and `None`.

**Code:** `vsslicer/modules/cura-settings/src/domain/...` (module: `cura-settings`, layer: `domain`)

## Acceptance criteria

- [ ] Each helper has tests for the normal case, a missing extruder, and a missing setting
- [ ] Semantics match the Cura reference values for the helper cases in the oracle table (checked in the compare card)
- [ ] A helper not in the supported set fails with its name

## Tasks

- [ ] Implement helpers
- [ ] Edge-case tests

## Progress

Not started.
