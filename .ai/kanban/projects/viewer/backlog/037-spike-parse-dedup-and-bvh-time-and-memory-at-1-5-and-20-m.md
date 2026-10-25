---
id: 37
title: "Spike: parse, dedup and BVH time and memory at 1, 5 and 20 M"
type: spike
priority: P0
effort: M
model: opus
area: [mesh]
story: US10
milestone: "VSS:M2"
sprint: "VSS:SP7"
depends_on: [36, 34]
created: 2026-10-25
---

Measures a throwaway pipeline (three.js STLLoader read for patterns only, three-mesh-bvh) to see whether 20 M triangles are feasible before the real parsers exist, and answers 3d-viewer open question 3.

**Code:** notes in `.reference/notes/` and numbers in `vsslicer/modules/mesh/README.md` (module: `mesh`, layer: n/a (spike))

## Acceptance criteria

- [ ] Time and peak memory recorded for parse, dedup and BVH at 1, 5 and 20 M in a worker
- [ ] States whether single-worker build fits and whether the bounding-box fallback is needed
- [ ] Method and machine recorded so the final benchmark can compare

## Tasks

- [ ] Prototype the pipeline
- [ ] Measure
- [ ] Write up

## Progress

Not started.
