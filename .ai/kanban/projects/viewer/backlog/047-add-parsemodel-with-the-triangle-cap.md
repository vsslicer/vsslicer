---
id: 47
title: Add parseModel with the triangle cap
type: feature
priority: P0
effort: S
model: sonnet
area: [mesh]
story: US15
milestone: "VSS:M2"
sprint: "VSS:SP6"
depends_on: [39, 40, 41, 42, 43, 44]
created: 2026-10-25
---

One entry point that picks the parser by extension or sniffing, dedups, computes stats and enforces a configurable cap that forces the caller to confirm.

**Code:** `vsslicer/modules/mesh/src/application/parseModel.ts` (module: `mesh`, layer: `application`)

## Acceptance criteria

- [ ] `parseModel(bytes, opts)` returns `IndexedMesh` and `MeshStats`
- [ ] Above the cap it returns a confirm-needed result; a file above the hard cap gives the typed error
- [ ] Cap default is a named constant to be set from the benchmark

## Tasks

- [ ] Use case
- [ ] Cap behaviour
- [ ] Tests

## Progress

Not started.
