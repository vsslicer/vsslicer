---
id: 39
title: Parse binary STL with guard rails
type: feature
priority: P0
effort: M
model: sonnet
area: [mesh]
story: US11
milestone: "VSS:M2"
sprint: "VSS:SP6"
depends_on: [38, 35]
created: 2026-10-25
---

Binary STL parser that checks the declared count against the file length and tells binary from ASCII by length, not the `solid` header.

**Code:** `vsslicer/modules/mesh/src/adapters/stl/` (module: `mesh`, layer: `adapters`)

## Acceptance criteria

- [x] Triangle counts and bounding boxes equal the three.js STLLoader on the binary and `solid`-header fixtures
- [x] Truncated file, count larger than the file and NaN or infinite coordinates raise the typed errors
- [x] Parsing is streaming over chunks

## Tasks

- [x] Parser
- [x] Guard rails
- [x] Oracle comparison test

## Progress

Done. `src/adapters/stl/binary-stl.ts`: `parseBinaryStl(chunks)` (sync or async iterable, records may straddle chunks, buffer grows with data so a hostile count cannot force allocation) then `weld`; `isBinaryStl(head, totalBytes)` decides by length. Errors: header short or a triangle cut = `TruncatedMeshError`; whole triangles missing or extra bytes = `TriangleCountMismatchError`; NaN/Inf = `NonFiniteCoordinateError` (vertex in file order, raised after the full read). Test `test/binary-stl.test.ts` compares counts and bounds with three.js STLLoader on the binary, solid-header and Cura fixtures at chunk sizes 1/7/50/whole. lint, build, test pass (26 tests). Not done: ASCII STL parser (separate card).

Changelog: VWR-39: `parseBinaryStl` (streaming, guard rails) and `isBinaryStl`.
Review passed (vwr3539-reviewer): hostile probes in scratch: count 2^32-1 on 134 B and 84 B files gives TriangleCountMismatchError with 0 MB growth; solid-header binary detected binary and parsed; empty/1-byte/mid-record chunk splits parse right; 1M triangles (48 MB) parses in 5.7 s, RSS +280 MB. Layer ok (adapters imports domain only). Note, no change: soup growth uses Float32Array.from with a callback (slow, doubles to ~2x peak); a set() into new Float32Array would be faster. pnpm lint fails only on prettier in VWR-36 files (scripts/generate-large-fixture.mjs, test/large-fixture.test.ts), not these cards.
