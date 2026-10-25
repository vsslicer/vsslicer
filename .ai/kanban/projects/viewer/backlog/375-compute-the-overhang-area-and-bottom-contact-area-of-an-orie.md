---
id: 375
title: Compute the overhang area and bottom contact area of an orientation
type: feature
priority: P2
effort: M
model: sonnet
area: [mesh]
story: US97
milestone: "VSS:M5"
sprint: "VSS:SP47"
depends_on: [38]
created: 2026-10-25
---

The two numbers the tests and the scorer compare: the area of faces overhanging more than a threshold angle, and the area of faces lying on the bed, for a mesh under a rotation.

**Code:** `vsslicer/modules/mesh/src/domain/orient/metrics.ts` (module: `mesh`, layer: `domain`)

## Acceptance criteria

- [ ] A cube on a face has zero overhang and a bottom area of one face; tilted 45 degrees it has the expected overhang
- [ ] Overhang threshold and bed tolerance are options with Orca's defaults
- [ ] No I/O in the folder (lint)

## Tasks

- [ ] Overhang
- [ ] Bottom area
- [ ] Tests

## Progress

Not started.
