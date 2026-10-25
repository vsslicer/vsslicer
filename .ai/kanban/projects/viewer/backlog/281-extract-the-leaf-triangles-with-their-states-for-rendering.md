---
id: 281
title: Extract the leaf triangles with their states for rendering
type: feature
priority: P2
effort: S
model: sonnet
area: [mesh, painting]
story: US81
milestone: "VSS:M5"
sprint: "VSS:SP29"
depends_on: [279]
created: 2026-10-25
---

Turns a `PaintLayer` and its mesh into flat arrays of leaf triangle positions and states that the webview uploads, and reports which triangles changed after a delta so only those are re-uploaded.

**Code:** `vsslicer/modules/mesh/src/application/paint/leaves.ts` (module: `mesh`, layer: `application`)

## Acceptance criteria

- [ ] Leaf positions cover exactly the painted triangles; unpainted triangles are not emitted
- [ ] After a delta, the changed-triangle list is exactly the triangles in the delta
- [ ] Output is typed arrays that can be transferred

## Tasks

- [ ] Extract
- [ ] Changed list
- [ ] Tests

## Progress

Not started.
