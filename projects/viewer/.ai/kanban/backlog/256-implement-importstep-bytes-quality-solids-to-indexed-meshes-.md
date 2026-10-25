---
id: 256
title: "Implement importStep(bytes, quality): solids to indexed meshes with product names"
type: feature
priority: P1
effort: M
model: sonnet
area: [step, mesh]
story: US67
milestone: "VSS:M4"
depends_on: [255, 254, 253]
created: 2026-10-25
---

Calls the reader with the quality, converts each solid's triangles to an `IndexedMesh`, takes names from the STEP product names and maps reader failures to the typed errors.

**Code:** `vsslicer/modules/mesh-step/src/application/importStep.ts` (module: `mesh-step`, layer: `application`)

## Acceptance criteria

- [ ] The assembly fixture returns the expected solid count with names
- [ ] The unsupported-schema and empty fixtures give their error classes
- [ ] Meshes pass the mesh statistics (finite, indexed)

## Tasks

- [ ] Use case
- [ ] Error mapping
- [ ] Tests

## Progress

Not started.
