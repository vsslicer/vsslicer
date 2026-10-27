---
id: 243
title: Compare repaired volume with Orca on the fixtures
type: feature
priority: P1
effort: M
model: sonnet
area: [mesh, repair]
story: US64
milestone: "VSS:M4"
sprint: "VSS:SP32"
depends_on: [241, 228]
created: 2026-10-25
---

Runs `repair` on every fixture and compares closedness, manifoldness and volume with the recorded Orca values.

**Code:** `vsslicer/modules/core/mesh/test/repair/request/` (module: `mesh`, layer: n/a (tests))

## Acceptance criteria

- [ ] Zero open and zero non-manifold edges after repair on the repairable fixtures
- [ ] Volume difference to Orca under 0.5 percent
- [ ] Runs on three operating systems

## Tasks

- [ ] Harness
- [ ] CI matrix

## Progress

Not started.
