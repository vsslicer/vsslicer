---
id: 371
title: Detect planes by flood fill of coplanar triangles from a picked triangle
type: feature
priority: P2
effort: M
model: opus
area: [mesh]
story: US95
milestone: "VSS:M5"
sprint: "VSS:SP49"
depends_on: [370, 233, 369]
created: 2026-10-25
---

From a triangle index and a hit point, grows the region of triangles within an angle and offset tolerance of the plane and returns it as a plane feature with its boundary edges. Written new; the feature-detection approach of PrusaSlicer's `Measure.cpp` (`PrusaSlicer@30ef591`) is read for guidance and any code taken from it carries the notice.

**Code:** `vsslicer/modules/core/mesh/src/application/measure/planes.ts` (module: `mesh`, layer: `application`)

## Acceptance criteria

- [ ] The planes of the cube, angled block and cylinder caps are found with normal error under 0.1 degrees
- [ ] A curved surface (cylinder side, sphere) is not reported as a plane
- [ ] The region of a plane on the 1 M fixture is found in under 200 ms (recorded)

## Tasks

- [ ] Flood fill
- [ ] Plane fit
- [ ] Tests

## Progress

Not started.
