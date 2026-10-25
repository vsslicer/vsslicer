---
id: 95
title: Export a generic 3MF with no vendor parts
type: feature
priority: P1
effort: M
model: sonnet
area: [3mf]
story: US34
milestone: "VSS:M4"
sprint: "VSS:SP24"
depends_on: [79, 87]
created: 2026-10-25
---

`exportGeneric(project)` writes core model parts only, with transforms baked into meshes or kept as build items, and no vendor `Metadata/`.

**Code:** `vsslicer/modules/3mf/src/adapters/core/` (module: `3mf`, layer: `adapters`)

## Acceptance criteria

- [ ] The output has no part under `Metadata/` and no vendor namespace
- [ ] Object positions equal those of the project (bounding boxes compared)
- [ ] Public types are added to the API report

## Tasks

- [ ] Writer on the core serialiser
- [ ] Bake or build-item choice
- [ ] Tests

## Progress

Not started.
