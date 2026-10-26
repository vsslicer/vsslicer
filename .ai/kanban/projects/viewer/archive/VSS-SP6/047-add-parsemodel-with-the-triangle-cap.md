---
id: 47
title: Add parseModel with the triangle cap
type: feature
priority: P0
effort: S
model: sonnet
area: [mesh]
story: US15
milestone: "VSS:M2"
sprint: "VSS:SP6"
depends_on: [39, 40, 41, 42, 43, 44]
created: 2026-10-25
---

One entry point that picks the parser by extension or sniffing, dedups, computes stats and enforces a configurable cap that forces the caller to confirm.

**Code:** `vsslicer/modules/mesh/src/application/parseModel.ts` (module: `mesh`, layer: `application`)

## Acceptance criteria

- [x] `parseModel(bytes, opts)` returns `IndexedMesh` and `MeshStats`
- [x] Above the cap it returns a confirm-needed result; a file above the hard cap gives the typed error
- [x] Cap default is a named constant to be set from the benchmark

## Tasks

- [x] Use case
- [x] Cap behaviour
- [x] Tests

## Progress

Done. `parseModel(bytes, opts)` in `src/application/parse-model.ts` (as `parseModelWith(parsers, ...)`, because application cannot import adapters; `src/adapters/parse-model.ts` wires the built-in parsers and exports `parseModel`). Detects by extension, else sniffs (binary STL by length, `solid` = ASCII, OBJ-looking text = OBJ, anything else goes to the binary parser so damage is named). Soft cap returns `{kind:'confirm-needed'}` unless `confirmed`; hard cap throws new `TooManyTrianglesError`; file-size cap throws `FileTooLargeError`. Binary STL is capped from its header before parsing. Defaults are named constants (1M soft, 10M hard, 1 GiB file), placeholders until VWR-37. `textLines` now throws `MalformedMeshError` for a line over 1 MiB (quadratic chunk joining). Verified: `pnpm lint && build && test` pass (51 tests, test/parse-model.test.ts). Not done: cap values from the benchmark.


Review passed (vwr374748-reviewer): lint, build, test pass (51). Checked soft cap confirm-needed (early from header for binary STL, after parse for ASCII/OBJ), hard cap TooManyTrianglesError even when confirmed, file-size cap, extension/sniff fallback (unknown bytes go to the binary parser to name damage), 1 MiB line cap. Notes, not blockers: ASCII/OBJ above the soft cap are fully parsed and discarded before confirm-needed, so confirming re-parses; a UTF-8 BOM on an extension-less OBJ sniffs as damaged binary.
Changelog: VWR-47 `parseModel` with soft/hard triangle and file-size caps.
