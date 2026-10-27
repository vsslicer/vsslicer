---
id: 282
title: Collect candidate triangles for a sphere or circle cursor with BVH shapecast
type: feature
priority: P2
effort: M
model: sonnet
area: [mesh, painting]
story: US81
milestone: "VSS:M5"
sprint: "VSS:SP42"
depends_on: [46]
created: 2026-10-25
---

Finds the triangles a cursor can touch using `shapecast` on the transferred BVH: all triangles within a radius for the sphere cursor, and the visible front-facing triangles in a cylinder along the view ray for the circle cursor (behaviour checked once against Orca's GUI and recorded).

**Code:** `vsslicer/modules/core/mesh/src/adapters/bvh/paintCursor.ts` (module: `mesh`, layer: `adapters`)

## Acceptance criteria

- [ ] Candidate sets equal a brute-force scan for 1,000 random cursors per fixture, both cursor types
- [ ] The circle cursor excludes back-facing and occluded triangles
- [ ] A 1 M triangle query is measured and recorded (feeds the perf card)

## Tasks

- [ ] Sphere query
- [ ] Circle query
- [ ] Brute-force comparison

## Progress

Not started.
