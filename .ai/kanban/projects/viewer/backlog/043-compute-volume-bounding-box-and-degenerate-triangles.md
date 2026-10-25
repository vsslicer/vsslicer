---
id: 43
title: "Compute volume, bounding box and degenerate triangles"
type: feature
priority: P0
effort: S
model: sonnet
area: [mesh]
story: US13
milestone: "VSS:M2"
sprint: "VSS:SP6"
depends_on: [42]
created: 2026-10-25
---

The cheap statistics: triangle count, bounding box, signed volume and degenerate triangle count.

**Code:** `vsslicer/modules/mesh/src/domain/stats/` (module: `mesh`, layer: `domain`)

## Acceptance criteria

- [ ] Volume of a unit cube and a known STL fixture is correct
- [ ] Degenerate triangles are counted on a fixture with zero-area faces

## Tasks

- [ ] Stats
- [ ] Tests

## Progress

Not started.
