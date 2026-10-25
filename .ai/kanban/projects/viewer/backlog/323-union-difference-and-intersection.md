---
id: 323
title: "Union, difference and intersection"
type: feature
priority: P2
effort: M
model: sonnet
area: [mesh]
story: US86
milestone: "VSS:M5"
sprint: "VSS:SP44"
depends_on: [321, 322, 275]
created: 2026-10-25
---

`boolean(op, a, b)` on two closed meshes with their transforms applied, returning one closed mesh or a typed error.

**Code:** `vsslicer/modules/mesh-boolean/src/application/boolean.ts` (module: `mesh-boolean`, layer: `application`)

## Acceptance criteria

- [ ] Volumes are within 0.5 percent of Orca's recorded mcut results on the fixtures, for all three operations
- [ ] Results have zero open and zero non-manifold edges (statistics)
- [ ] Operands with an open edge are refused with the message; an empty intersection returns the empty-result error
- [ ] Union of disjoint meshes keeps both bodies

## Tasks

- [ ] Boolean function
- [ ] Fixture comparison
- [ ] Refusal tests

## Progress

Not started.
