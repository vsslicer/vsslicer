---
id: 241
title: "Compose repair(mesh, options) with the unrepairable report"
type: feature
priority: P1
effort: M
model: opus
area: [mesh, repair]
story: US64
milestone: "VSS:M4"
sprint: "VSS:SP32"
depends_on: [238, 240, 234]
created: 2026-10-25
---

`repair(mesh, options) -> {mesh, report}` runs the lossless steps, hole filling and self-intersection removal in Orca's order, verifies the result with the statistics, and returns the original unchanged when it cannot make a closed manifold.

**Code:** `vsslicer/modules/mesh/src/application/repair.ts` (module: `mesh`, layer: `application`)

## Acceptance criteria

- [ ] The fixtures end closed and manifold by the statistics
- [ ] A large missing region returns the original mesh and an unrepairable outcome in the report
- [ ] A tolerance option changes the merge and is recorded in the report

## Tasks

- [ ] Pipeline
- [ ] Verification
- [ ] Tests

## Progress

Not started.
