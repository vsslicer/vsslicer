---
id: 234
title: Compose repairOnLoad from the lossless steps
type: feature
priority: P1
effort: S
model: sonnet
area: [mesh, repair]
story: US63
milestone: "VSS:M4"
depends_on: [231, 232, 233]
created: 2026-10-25
---

`repairOnLoad(mesh) -> {mesh, report}` runs merge, degenerate removal and normals in order and returns the report; it never fills holes.

**Code:** `vsslicer/modules/mesh/src/application/repairOnLoad.ts` (module: `mesh`, layer: `application`)

## Acceptance criteria

- [ ] Output on the defect fixtures has no duplicate vertices, degenerate faces or flipped normals
- [ ] A clean mesh is returned unchanged (same arrays)
- [ ] Holes remain (not filled here)

## Tasks

- [ ] Composition
- [ ] Tests

## Progress

Not started.
