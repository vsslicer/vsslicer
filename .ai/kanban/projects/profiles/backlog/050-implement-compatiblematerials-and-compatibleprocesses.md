---
id: 50
title: Implement compatibleMaterials and compatibleProcesses
type: feature
priority: P0
effort: S
model: sonnet
area: [store]
story: US22
milestone: "VSS:M2"
sprint: "VSS:SP10"
depends_on: [49, 135]
created: 2026-10-25
---

Compatibility queries by running each candidate's `when` against a printer instance.

**Code:** `vsslicer/modules/profiles/src/application/resolve/` (module: `profiles`, layer: `application`)

## Acceptance criteria

- [ ] A Prusa fixture with `nozzle_diameter[0]!=0.6` excludes the 0.6 nozzle's materials and includes the 0.4's (oracle: the evaluator truth table)
- [ ] An abstract entity is never returned
- [ ] A condition that fails to parse is treated as compatible with a diagnostic

## Tasks

- [ ] Write the queries
- [ ] Tests

## Progress

Not started.
