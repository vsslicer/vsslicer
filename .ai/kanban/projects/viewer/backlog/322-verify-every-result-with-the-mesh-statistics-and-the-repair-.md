---
id: 322
title: Verify every result with the mesh statistics and the repair check
type: feature
priority: P2
effort: S
model: sonnet
area: [mesh]
story: US90
milestone: "VSS:M5"
sprint: "VSS:SP48"
depends_on: [319, 244]
created: 2026-10-25
---

Every cut and boolean result passes through the statistics (zero open and zero non-manifold edges); a result that fails goes through repair once, and still failing is returned as an error, never as a mesh.

**Code:** `vsslicer/modules/core/mesh-boolean/src/application/verify.ts` (module: `mesh-boolean`, layer: `application`)

## Acceptance criteria

- [ ] A closed result passes untouched; a result with one defect is repaired and reported as repaired
- [ ] A result that cannot be made closed returns the error with the counts
- [ ] No WASM import (runs on plain meshes)

## Tasks

- [ ] Verify
- [ ] Repair once
- [ ] Tests

## Progress

Not started.
