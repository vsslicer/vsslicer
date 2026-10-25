---
id: 42
title: Deduplicate vertices into indexed geometry
type: feature
priority: P0
effort: M
model: sonnet
area: [mesh]
story: US13
milestone: "VSS:M2"
sprint: "VSS:SP6"
depends_on: [38]
created: 2026-10-25
---

Hash-based welding of identical vertices to indexed form; also `fromArrays` for E8's typed arrays.

**Code:** `vsslicer/modules/mesh/src/domain/` (module: `mesh`, layer: `domain`)

## Acceptance criteria

- [ ] Re-expanding the indexed mesh gives the same triangle set as the input (property test on random meshes)
- [ ] About 24 bytes per triangle on a fixture
- [ ] `fromArrays(positions, indices)` validates and wraps typed arrays

## Tasks

- [ ] Dedup
- [ ] fromArrays
- [ ] Property test

## Progress

Not started.
