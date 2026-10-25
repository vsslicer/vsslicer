---
id: 38
title: "Define IndexedMesh, MeshStats and mesh errors"
type: feature
priority: P0
effort: S
model: sonnet
area: [mesh]
story: US11
milestone: "VSS:M2"
sprint: "VSS:SP7"
depends_on: [34]
created: 2026-10-25
---

Domain types with the typed errors for every mesh error class.

**Code:** `vsslicer/modules/mesh/src/domain/` (module: `mesh`, layer: `domain`)

## Acceptance criteria

- [ ] `IndexedMesh` holds `Float32Array` positions and `Uint32Array` indices, groups as parts, and a bounding box
- [ ] `MeshStats` type and typed errors for truncated, count mismatch, non-finite coordinates, OBJ index out of range and file above cap, each with a user message
- [ ] No I/O in the folder

## Tasks

- [ ] Types
- [ ] Errors
- [ ] Tests

## Progress

Not started.
