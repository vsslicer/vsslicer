---
id: 16
title: "Read components, build items, transforms and materials"
type: feature
priority: P0
effort: M
model: sonnet
area: [3mf]
story: US3
milestone: "VSS:M2"
depends_on: [15]
created: 2026-10-25
---

Resolves component trees, build items with transforms and base materials and colour groups into the Project model.

**Code:** `vsslicer/modules/3mf/src/adapters/model/` (module: `3mf`, layer: `adapters`)

## Acceptance criteria

- [ ] Component trees and 3x4 transforms resolve to the right world matrices on fixtures
- [ ] Base materials and colour groups are attached to triangles or objects as specified
- [ ] Consortium positive cases for these features pass

## Tasks

- [ ] Components and transforms
- [ ] Build items
- [ ] Materials and colours
- [ ] Tests

## Progress

Not started.
