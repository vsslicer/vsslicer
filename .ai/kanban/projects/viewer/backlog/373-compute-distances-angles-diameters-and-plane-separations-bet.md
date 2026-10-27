---
id: 373
title: "Compute distances, angles, diameters and plane separations between features"
type: feature
priority: P2
effort: M
model: sonnet
area: [mesh]
story: US95
milestone: "VSS:M5"
sprint: "VSS:SP49"
depends_on: [371, 372]
created: 2026-10-25
---

`measure(a, b)` returns the right result for each pair of feature kinds: point to point, point to plane, edge to edge angle, plane to plane angle or separation, circle diameter, circle to circle centre distance.

**Code:** `vsslicer/modules/core/mesh/src/application/measure/measure.ts` (module: `mesh`, layer: `application`)

## Acceptance criteria

- [ ] On the fixtures every expected value is matched within 0.01 mm and 0.1 degree (calibration cube edge, cylinder diameter, angled block angle, parallel plane separation)
- [ ] Unsupported pairs return a typed "no measurement" result, not a number
- [ ] Parallel planes give a separation; non-parallel give an angle

## Tasks

- [ ] Pair table
- [ ] Fixture checks

## Progress

Not started.
