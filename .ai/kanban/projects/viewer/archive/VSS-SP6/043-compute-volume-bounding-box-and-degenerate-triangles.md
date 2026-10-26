---
id: 43
title: "Compute volume, bounding box and degenerate triangles"
type: feature
priority: P0
effort: S
model: sonnet
area: [mesh]
story: US13
milestone: "VSS:M2"
sprint: "VSS:SP6"
depends_on: [42]
created: 2026-10-25
---

The cheap statistics: triangle count, bounding box, signed volume and degenerate triangle count.

**Code:** `vsslicer/modules/mesh/src/domain/stats/` (module: `mesh`, layer: `domain`)

## Acceptance criteria

- [x] Volume of a unit cube and a known STL fixture is correct
- [x] Degenerate triangles are counted on a fixture with zero-area faces

## Tasks

- [x] Stats
- [x] Tests

## Progress

Done. `computeStats(mesh)` in `src/domain/stats/compute-stats.ts` returns all MeshStats fields (also open and non-manifold edges). Verified: unit cube volume 1 (-1 flipped), scaled box 24, open cube 4 open edges, fixture with 2 degenerate triangles. No STL file fixture: a generated box stands in (STL parser not yet in module). Own formula, admesh not used. Edge keys exact to about 9e7 vertices (commented shortcut).

Changelog: VWR-43 `computeStats`.

Review passed (vwr4243-reviewer): lint/build/test green. Probes: volume, degenerate, open and non-manifold edge counts equal a brute-force reference on 300 random meshes; 1M-triangle grid stats 0.75s, open edges 2832 = 4*708 boundary, as expected. Generated-box stand-in for the "known STL fixture" accepted (no STL parser in the module yet; unit cube 1, box 24 exact). Edge key a*n+b is exact to n about 9.49e7 vertices, so the 9e7 shortcut note is correct and conservative.
