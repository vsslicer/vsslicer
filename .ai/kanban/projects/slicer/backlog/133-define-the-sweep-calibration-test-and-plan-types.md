---
id: 133
title: "Define the sweep, calibration test and plan types"
type: feature
priority: P2
effort: S
model: sonnet
area: [calibration]
story: US40
milestone: "VSS:M5"
sprint: "VSS:SP37"
depends_on: [132]
created: 2026-10-25
---

The vocabulary every generator shares: a `Sweep` (parameter, block values, layer rule, firmware command), a `CalibrationTest` (id, parameters, target profile key) and a `CalibrationPlan` (test model, sweep, blocks with value and layer range).

**Code:** `vsslicer/modules/calibration/src/domain/...` (module: `calibration`, layer: `domain`)

## Acceptance criteria

- [ ] Types compile and are exported; a type-level test pins the field list
- [ ] A plan lists blocks with value and layer range in order; a test builds a plan by hand and reads it back
- [ ] Every exported symbol has a doc comment

## Tasks

- [ ] Write the types
- [ ] Type tests
- [ ] README example

## Progress

Not started.
