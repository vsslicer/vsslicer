---
id: 260
title: "Compare solid counts and volumes with PrusaSlicer's import"
type: feature
priority: P1
effort: M
model: sonnet
area: [step, mesh]
story: US67
milestone: "VSS:M4"
sprint: "VSS:SP32"
depends_on: [258, 253]
created: 2026-10-25
---

Imports every fixture at the default quality and compares solid count and volume with the recorded PrusaSlicer values.

**Code:** `vsslicer/modules/core/mesh-step/test/oracle/` (module: `mesh-step`, layer: n/a (tests))

## Acceptance criteria

- [ ] Solid counts equal and volumes within 0.5 percent on all valid fixtures
- [ ] The PrusaSlicer release is printed in the test log

## Tasks

- [ ] Harness
- [ ] Comparison

## Progress

Not started.
