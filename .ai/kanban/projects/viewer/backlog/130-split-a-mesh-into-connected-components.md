---
id: 130
title: Split a mesh into connected components
type: feature
priority: P1
effort: M
model: sonnet
area: [mesh]
story: US45
milestone: "VSS:M4"
sprint: "VSS:SP26"
depends_on: [42]
created: 2026-10-25
---

Finds connected components of an indexed mesh by shared vertices and returns one mesh per component with the original triangle order kept inside each.

**Code:** `vsslicer/modules/core/mesh/src/domain/split/` (module: `mesh`, layer: `domain`)

## Acceptance criteria

- [ ] A two-shell fixture yields two meshes whose triangle sets equal the originals
- [ ] A mesh with one shell returns itself
- [ ] 1M-triangle mesh splits within the recorded budget in a worker (see the worker card)

## Tasks

- [ ] Union-find over indexed triangles
- [ ] Output meshes
- [ ] Tests

## Progress

Not started.
