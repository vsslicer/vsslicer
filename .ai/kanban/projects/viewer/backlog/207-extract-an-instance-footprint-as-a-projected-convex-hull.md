---
id: 207
title: Extract an instance footprint as a projected convex hull
type: feature
priority: P1
effort: M
model: sonnet
area: [arrange]
story: US58
milestone: "VSS:M4"
sprint: "VSS:SP29"
depends_on: [205]
created: 2026-10-25
---

From a vertex array and a 4x4 transform, projects to the plate and returns the convex hull polygon.

**Code:** `vsslicer/modules/core/arrange/src/domain/footprint/` (module: `arrange`, layer: `domain`)

## Acceptance criteria

- [ ] The hull of a known mesh equals the expected polygon
- [ ] A 1M-vertex input finishes within the recorded budget
- [ ] Degenerate input (all points collinear) returns a minimal polygon, not an error

## Tasks

- [ ] Projection
- [ ] Hull
- [ ] Tests

## Progress

Not started.
