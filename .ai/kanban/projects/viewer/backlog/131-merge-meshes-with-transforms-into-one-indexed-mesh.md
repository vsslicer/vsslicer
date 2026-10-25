---
id: 131
title: Merge meshes with transforms into one indexed mesh
type: feature
priority: P1
effort: S
model: sonnet
area: [mesh]
story: US45
milestone: "VSS:M4"
sprint: "VSS:SP25"
depends_on: [38]
created: 2026-10-25
---

Concatenates meshes after applying each transform, offsetting indices, and keeps a part map.

**Code:** `vsslicer/modules/mesh/src/domain/merge/` (module: `mesh`, layer: `domain`)

## Acceptance criteria

- [ ] Merge then split gives back the triangle sets (with the split card's test)
- [ ] A transform with negative determinant flips winding
- [ ] The part map gives each source its triangle range

## Tasks

- [ ] Merge function
- [ ] Part map
- [ ] Tests

## Progress

Not started.
