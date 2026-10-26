---
id: 379
title: "Compose orient(meshes, options) and compare overhang with Orca"
type: feature
priority: P2
effort: M
model: sonnet
area: [mesh]
story: US97
milestone: "VSS:M5"
sprint: "VSS:SP48"
depends_on: [378, 374]
created: 2026-10-25
---

`orient(mesh, options)` returns the best rotation and its metrics; `orient(objects)` does it per object. This is the function the slicer UI calls for its pre-slice option.

**Code:** `vsslicer/modules/mesh/src/application/orient/orient.ts` (module: `mesh`, layer: `application`)

## Acceptance criteria

- [ ] On every fixture the overhang area after orienting is less than or equal to the overhang area after Orca's rotation
- [ ] A symmetrical mesh returns a rotation without error; a mesh with no better orientation returns the identity
- [ ] The result lists the overhang and bottom area before and after

## Tasks

- [ ] Compose
- [ ] Orca comparison
- [ ] Tests

## Progress

Not started.
