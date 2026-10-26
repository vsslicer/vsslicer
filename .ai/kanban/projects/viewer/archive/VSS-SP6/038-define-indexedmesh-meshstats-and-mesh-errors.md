---
id: 38
title: "Define IndexedMesh, MeshStats and mesh errors"
type: feature
priority: P0
effort: S
model: sonnet
area: [mesh]
story: US11
milestone: "VSS:M2"
sprint: "VSS:SP6"
depends_on: [34]
created: 2026-10-25
---

Domain types with the typed errors for every mesh error class.

**Code:** `vsslicer/modules/mesh/src/domain/` (module: `mesh`, layer: `domain`)

## Acceptance criteria

- [x] `IndexedMesh` holds `Float32Array` positions and `Uint32Array` indices, groups as parts, and a bounding box
- [x] `MeshStats` type and typed errors for truncated, count mismatch, non-finite coordinates, OBJ index out of range and file above cap, each with a user message
- [x] No I/O in the folder

## Tasks

- [x] Types
- [x] Errors
- [x] Tests

## Progress

Done in `vsslicer/modules/mesh/src/domain/` (`indexed-mesh.ts`, `mesh-stats.ts`, `errors.ts`), exported from `src/index.ts`; tests in `test/domain.test.ts`. `IndexedMesh` = positions, indices, `parts` (name, firstTriangle, triangleCount; one part when ungrouped), `bounds`. `MeshStats` = triangle and vertex counts, bounds, volume, open edges, non-manifold edges, degenerate triangles (fields from US13). Errors extend `MeshError` (`code`, user `message`): TruncatedMeshError, TriangleCountMismatchError, NonFiniteCoordinateError, ObjIndexOutOfRangeError, FileTooLargeError. Types are checked by `expectTypeOf`; errors by code and message. `pnpm install && lint && build && test` pass (8 tests); domain imports nothing but domain. Errors are classes without parameter properties (`erasableSyntaxOnly`). Not done: parsers, stats computation.

Changelog: VWR-38: IndexedMesh, MeshPart, BoundingBox, MeshStats and typed MeshErrors (added under Unreleased).

Review passed (vwr3438-reviewer): types match US11 (truncated, count mismatch, non-finite, file cap) and US13 (MeshStats fields incl. admesh edge counts); research 3d-viewer.md lessons (validate declared counts, cap size) covered; domain has no imports/I-O; lint/build/test green.
