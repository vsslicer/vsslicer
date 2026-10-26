---
id: 42
title: Deduplicate vertices into indexed geometry
type: feature
priority: P0
effort: M
model: sonnet
area: [mesh]
story: US13
milestone: "VSS:M2"
sprint: "VSS:SP6"
depends_on: [38]
created: 2026-10-25
---

Hash-based welding of identical vertices to indexed form; also `fromArrays` for E8's typed arrays.

**Code:** `vsslicer/modules/mesh/src/domain/` (module: `mesh`, layer: `domain`)

## Acceptance criteria

- [x] Re-expanding the indexed mesh gives the same triangle set as the input (property test on random meshes)
- [x] About 24 bytes per triangle on a fixture
- [x] `fromArrays(positions, indices)` validates and wraps typed arrays

## Tasks

- [x] Dedup
- [x] fromArrays
- [x] Property test

## Progress

Done. `weld(soup, parts?)` and `fromArrays(positions, indices, parts?)` in `vsslicer/modules/mesh/src/domain/build-mesh.ts`, exported from index. Exact float32-bit hash, -0 folded to 0, non-finite rejected. Verified: `test/build-mesh.test.ts` (cube, two cubes sharing a face, 50 seeded random meshes re-expand identically, fromArrays validation); lint, build, test pass. Cube is 20 bytes/triangle. Own code, no upstream port. Not done: tolerance welding.

Changelog: VWR-42 `weld` and `fromArrays`.

Review passed (vwr4243-reviewer): lint/build/test green (15 tests). Probes: 300 random meshes with shared/duplicate/-0 vertices match a brute-force string-key weld; NaN/Inf rejected; -0 folded; bad lengths throw. 1M-triangle generated grid: weld 1.1s, 18 bytes/triangle (the "about 24" criterion is a ceiling; accepted, cube is 20), RSS about 260MB peak. Layers clean, no upstream code.
