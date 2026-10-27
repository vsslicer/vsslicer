---
id: 132
title: "Generate box, cylinder and sphere meshes for volumes"
type: feature
priority: P1
effort: S
model: sonnet
area: [mesh]
story: US46
milestone: "VSS:M4"
sprint: "VSS:SP28"
depends_on: [44]
created: 2026-10-25
---

Closed, outward-facing meshes of a box, cylinder and sphere with size and segment parameters.

**Code:** `vsslicer/modules/core/mesh/src/domain/primitives/` (module: `mesh`, layer: `domain`)

## Acceptance criteria

- [ ] Each primitive has zero open edges and zero non-manifold edges by the mesh statistics
- [ ] Volume is within 0.5 percent of the analytic value at the default segments

## Tasks

- [ ] Three generators
- [ ] Tests

## Progress

Not started.
