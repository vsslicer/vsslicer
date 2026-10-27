---
id: 370
title: Define measurement features and results
type: feature
priority: P2
effort: S
model: sonnet
area: [mesh]
story: US95
milestone: "VSS:M5"
sprint: "VSS:SP47"
depends_on: [38]
created: 2026-10-25
---

A feature is a point, an edge, a circle (centre, radius, axis) or a plane (point, normal); a result is a distance, an angle, a diameter or a plane separation, each with the two features it came from.

**Code:** `vsslicer/modules/core/mesh/src/domain/measure/types.ts` (module: `mesh`, layer: `domain`)

## Acceptance criteria

- [ ] Types and constructors; results carry their unit (mm or degrees)
- [ ] No I/O in the folder (lint)

## Tasks

- [ ] Types
- [ ] Tests

## Progress

Not started.
