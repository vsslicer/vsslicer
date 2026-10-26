---
id: 15
title: "Read core objects, meshes and metadata"
type: feature
priority: P0
effort: M
model: sonnet
area: [3mf]
story: US3
milestone: "VSS:M2"
sprint: "VSS:SP6"
depends_on: [7, 14, 1]
created: 2026-10-25
---

Streams the root model XML into objects with typed-array meshes and metadata.

**Code:** `vsslicer/modules/3mf/src/adapters/model/` (module: `3mf`, layer: `adapters`)

## Acceptance criteria

- [x] Meshes come out as typed arrays with correct counts on the Consortium positives and the dialect fixtures
- [x] Malformed XML and missing root model give the typed errors
- [x] A 100 MB sub-model parses without holding the XML text in memory

## Tasks

- [x] Streaming vertex and triangle reader
- [x] Metadata reader
- [x] Tests

## Progress

Review fixes (vwr15-fix): triangle/property indices are strict decimal and bounded (vertex indices <= 2^32-1 before the Uint32Array write, then < vertex count at mesh close; property indices <= 2^31-1); element depth capped at 64 in opentag (100k nested fails in well under 1 s, tested); num() rejects "", "0x10" (strict decimal regex, also for transforms); index() rejects "1e0"; a second <mesh> in an object is a MalformedXmlError. Tests added in test/readModel.test.ts. Verified: lint, build, test pass (one load-flaky zipWriter timeout passes alone). Not done: degenerate triangles, unit/type validation.
Changelog: 3mf: model reader rejects out-of-range/non-decimal numbers, nesting deeper than 64 and duplicate meshes.

Review passed (vwr1516-reviewer): re-ran after the fix round. Index 2^32 wrap now rejected (triangle v1 is too large); 100k-deep XML rejected at depth 64; all 277 model parts in 215 real .3mf under .reference/repos parse with vertex/triangle counts equal to raw tag counts (0 mismatches); 1M-triangle part parses in 2.8s. Module-wide: pnpm install/lint/build/test pass (132 tests), prettier clean.
