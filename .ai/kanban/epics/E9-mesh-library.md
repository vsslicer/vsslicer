---
id: E9
title: Build @vsslicer/mesh for STL and OBJ parsing in workers with a BVH
status: reviewed
initiative: I2
project: VWR
order: 2
depends_on: [E8, E9]
rows: ["§3 Import STL, OBJ, 3MF"]
---

`@vsslicer/mesh` turns model files into compact indexed meshes off the UI and extension-host threads, and builds the bounding-volume hierarchy that picking, measure, painting and arrange need later. The viewer (E10) uses it to open STL, OBJ and the meshes of a 3MF; the editor epics use it for every geometric operation.

## Scope

In:
- Binary and ASCII STL parser and OBJ parser (geometry, groups as parts; `.mtl` ignored), written new in TypeScript. three.js `STLLoader` is read for patterns only (MIT).
- Vertex deduplication to indexed geometry (about 24 bytes per triangle instead of 72; `3d-viewer.md` §3).
- BVH build through three-mesh-bvh (MIT) in a worker, with serialise and deserialise so a BVH built once can be transferred.
- Mesh statistics: triangle count, bounding box, volume, open-edge and non-manifold-edge counts, degenerate triangles. Repair is E36; this epic only reports.
- Runs in a Web Worker pool in the webview and in `worker_threads` in the extension host; results cross as transferred `ArrayBuffer`s through the E9 transport.
- Guard rails from `meshview`/`nightmesh`: declared STL triangle count checked against file length; a configurable triangle cap (default chosen by the E10 benchmark) above which the caller must confirm.

Out: mesh repair (E36), STEP (E37), painting model (E52), boolean and cut (E53), decimation proxies (E10 decides whether it needs them), AMF and other formats (P3, E56).

## Feature-matrix rows

- §3 Import STL, OBJ, 3MF (P0): done when STL (binary and ASCII), OBJ and every mesh object of a 3MF read by E8 come out as indexed meshes with a BVH and statistics, ready for E10 to render.

## Acceptance criteria

- [ ] Fixture STL (binary, ASCII, ASCII with CRLF and odd whitespace, a binary STL whose header begins with `solid`) and OBJ (quads, negative indices, groups) files parse to the expected triangle counts and bounding boxes; three.js loaders are the oracle for counts.
- [ ] Deduplicated meshes are topologically identical to the source (same triangle set after re-expansion); property test on random meshes.
- [ ] BVH raycasts agree with brute-force raycasts on 10,000 random rays per fixture.
- [ ] Open-edge and non-manifold counts match admesh's report on the same fixtures (admesh CLI as oracle in CI).
- [ ] Parse plus dedup plus BVH times and peak memory recorded for 1, 5 and 20 M triangle STLs; the numbers go into E10's budgets.
- [ ] Error classes each with a fixture and typed error: truncated binary STL, declared count larger than the file, NaN or infinite coordinates, OBJ face index out of range, file above the cap.
- [ ] Verified only on fixtures (D5).

## Dependencies

- Needs E8 (tooling) and E9 (worker pool and `ArrayBuffer` transfer in the message transport).
- Consumes E8's typed mesh arrays for 3MF objects.
- Exposes `parseStl`, `parseObj`, `fromArrays`, `IndexedMesh`, `buildBvh`, `MeshStats` to E37 and every editor epic (E33 to E55).

## Risks and spikes

- BVH build time and memory at 5 to 20 M triangles are unknown (`3d-viewer.md` open question 3). Spike: the benchmark in the acceptance criteria is the first story; if 20 M triangles cannot be indexed within budget, E10 falls back to a bounding-box placeholder with "draw anyway".
- `SharedArrayBuffer` is assumed unavailable in webviews, so the parallel BVH builder cannot be used; single-worker build is the baseline.
- Worker creation under the webview CSP (`3d-viewer.md` open question 2) is resolved by E9; this epic consumes its answer.

## Eng review

- Scope challenge: kept as its own epic (library vs extension boundary) and small: parse, dedup, BVH, stats. Detection of broken meshes stays here because it is cheap and the viewer should warn before E36 exists.
- Tests: three.js loader counts catch parser regressions; brute-force raycast catches BVH bugs; admesh catches topology-statistics mistakes.
- Blast radius: a worker crash fails one file open with a message; nothing runs on the host thread.
- Reversibility: pure library with no persisted state.
- Changed because of the review: added the `solid`-header binary STL fixture (a known STL trap) and the benchmark as the first story.
