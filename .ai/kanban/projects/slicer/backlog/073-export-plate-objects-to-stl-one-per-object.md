---
id: 73
title: "Export plate objects to STL, one per object"
type: feature
priority: P1
effort: S
model: sonnet
area: [cura]
story: US16
milestone: "VSS:M3"
sprint: "VSS:SP22"
depends_on: [65]
created: 2026-10-25
---

Uses the `mesh` module's STL writer to export each object of the plate, transformed to the plate position, since CuraEngine reads no 3MF.

**Code:** `vsslicer/modules/slicer/cura/src/adapters/...` (module: `slicer-cura`, layer: `adapters`)

## Acceptance criteria

- [ ] A two-object plate gives two STLs whose bounding boxes match the plate positions
- [ ] Object names are kept for `;MESH:` labels
- [ ] Instances are repeated, not merged

## Tasks

- [ ] Plate to meshes
- [ ] Write STL
- [ ] Tests

## Progress

Not started.
