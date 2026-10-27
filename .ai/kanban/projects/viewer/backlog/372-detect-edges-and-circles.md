---
id: 372
title: Detect edges and circles
type: feature
priority: P2
effort: M
model: opus
area: [mesh]
story: US95
milestone: "VSS:M5"
sprint: "VSS:SP47"
depends_on: [370, 233, 369]
created: 2026-10-25
---

Finds the sharp edge under the cursor and, when it belongs to a closed loop of edges lying on a circle, the circle with its centre, radius and axis. Written new, same approach note as the plane detection.

**Code:** `vsslicer/modules/core/mesh/src/application/measure/edges.ts` (module: `mesh`, layer: `application`)

## Acceptance criteria

- [ ] The cylinder rim gives a circle of radius 10 within 0.01 mm and its axis within 0.1 degrees
- [ ] A straight cube edge gives an edge feature with its length
- [ ] A polygon with few sides is not reported as a circle (fit error limit tested)

## Tasks

- [ ] Sharp edges
- [ ] Circle fit
- [ ] Tests

## Progress

Not started.
