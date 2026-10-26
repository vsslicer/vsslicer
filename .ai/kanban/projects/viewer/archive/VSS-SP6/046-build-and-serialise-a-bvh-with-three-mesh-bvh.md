---
id: 46
title: Build and serialise a BVH with three-mesh-bvh
type: feature
priority: P0
effort: M
model: opus
area: [mesh]
story: US14
milestone: "VSS:M2"
sprint: "VSS:SP6"
depends_on: [42]
created: 2026-10-25
---

Builds the BVH in a worker and round-trips it as transferable buffers so it is built once.

**Code:** `vsslicer/modules/mesh/src/adapters/bvh/` (module: `mesh`, layer: `adapters`)

## Acceptance criteria

- [x] `buildBvh`, `serialiseBvh` and `deserialiseBvh` exist; the deserialised BVH gives identical raycasts
- [x] Raycasts agree with brute force on 10,000 random rays per fixture
- [x] No `SharedArrayBuffer` required

## Tasks

- [x] Wrapper
- [x] Serialise
- [x] Brute-force comparison

## Progress

Done (vwr46-worker).

- `src/adapters/bvh/bvh.ts`: `buildBvh(mesh)` (three-mesh-bvh `MeshBVH`, `indirect: true` so the mesh's
  `indices` are never reordered and hit `faceIndex` is the mesh's own triangle number), `serialiseBvh(bvh)`
  returning `{ data, transfer }` (no copy; plain `ArrayBuffer`s, Uint16 or Uint32 indirect buffer) and
  `deserialiseBvh(data, mesh)`. No port: one implementation, no second side today. Domain untouched.
- Dependencies added, exact-pinned (package.json + lockfile changed): `three@0.186.1`, `three-mesh-bvh@0.9.16`
  (both MIT), dev `@types/three@0.186.0`.
- Verified: `pnpm lint && pnpm build && pnpm test` pass (19 tests). `test/bvh.test.ts`: on a UV sphere and a
  2,000-triangle random soup, 10,000 seeded random rays each match brute force (`Ray.intersectTriangle`
  over every triangle) on hit/miss and distance (5 digits); round trip through `structuredClone(..., { transfer })`
  gives identical distance and faceIndex on 2,000 rays, transferred buffers are detached, none is a SharedArrayBuffer.
- Bench at 1M triangles (Apple M1 Pro, Node v26.12.1, UV sphere, 3 runs, scratch script): build 290-369 ms;
  BVH buffers 12.5 MB (~13 B/tri) over a 17.2 MB mesh; RSS +163-190 MB after build (transient build scratch,
  heap +0.2 MB); transfer 0.2 ms; deserialise 0.1 ms; 10k `raycastFirst` 37-42 ms. Node only, not Chrome; 5M/20M not run.
- Not done: building inside a worker (VWR-48/49 own that); closest-point not tested (raycast covered).
- Reviewer: `serialiseBvh` hands out the live buffers, so the source BVH is dead after transfer (documented).
  `deserialiseBvh` passes `version: 1` to avoid three-mesh-bvh's old-format fix-up.
- Files: `vsslicer/modules/mesh/{package.json,pnpm-lock.yaml,src/index.ts,src/adapters/bvh/bvh.ts,test/bvh.test.ts}`.
  Notes: `.reference/notes/VWR-46-bvh.md`.

Review passed (vwr46-reviewer): lint/build/test green (19 tests); MIT licences confirmed in node_modules; indirect keeps mesh.indices (tested); version:1 + setIndex:false matches MeshBVH.deserialize (skips fixupVersion0, no index overwrite); transfer detaches buffers, ArrayBuffer only; only named imports from three (three-mesh-bvh sideEffects:false, tree-shakeable), VS Code API/three absent from domain, code in adapters only.

Changelog: - VWR-46: `buildBvh`, `serialiseBvh`, `deserialiseBvh` (three-mesh-bvh, indirect, transferable buffers).
