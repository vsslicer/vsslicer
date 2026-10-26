---
id: 41
title: Parse OBJ with groups
type: feature
priority: P0
effort: M
model: sonnet
area: [mesh]
story: US12
milestone: "VSS:M2"
sprint: "VSS:SP6"
depends_on: [38, 35]
created: 2026-10-25
---

OBJ parser for geometry only: triangulates quads and n-gons, handles negative indices, groups become parts, `.mtl` ignored.

**Code:** `vsslicer/modules/mesh/src/adapters/obj/` (module: `mesh`, layer: `adapters`)

## Acceptance criteria

- [x] Counts and bounding boxes equal three.js OBJLoader on the fixtures
- [x] Face index out of range raises the typed error
- [x] Groups map to parts

## Tasks

- [x] Parser
- [x] Triangulation
- [x] Tests

## Progress

Done. `parseObj(chunks)`: v, f (tri/quad/n-gon fan, negative indices, v/vt/vn and v//vn), g/o names become parts (consecutive faces under one name merge; empty groups dropped). Counts and bounds equal three.js on quads, negative, groups and the Cura OBJ; box-index-out-of-range raises `ObjIndexOutOfRangeError` (three.js accepts it); index 0, bad numbers, faces under 3 vertices raise `MalformedMeshError`.
Files: `src/adapters/text.ts` (shared line splitter, strict number, growable buffer), `src/adapters/stl/ascii-stl.ts`, `src/adapters/obj/obj.ts`, `src/domain/errors.ts` (+`MalformedMeshError`), `src/index.ts`, `test/text-mesh.test.ts`, CHANGELOG (Unreleased lines added, per instruction).
Verified: `pnpm lint && pnpm build && pnpm test` pass (37 tests); each fixture compared to three.js at chunk sizes 1, 3, 17, 4096, whole.
Not done: `\` line continuation, w/colour fields are ignored, `.mtl` ignored by design.
Changelog: VWR-41: `parseObj`.

Review passed (vwr364041-reviewer): 1M-vertex n-gon in 0.4 s, index 1e20 / 2^32+1 give ObjIndexOutOfRangeError, negative indices ok, UTF-8 split across 1-byte chunks ok, 1e999 gives NonFiniteCoordinateError; MalformedMeshError (code 'malformed', line) added and exported, no layer violations (text.ts adapters only); prettier clean. Same non-blocking long-line note as VWR-40.
