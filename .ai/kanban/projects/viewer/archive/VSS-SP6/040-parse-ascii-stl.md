---
id: 40
title: Parse ASCII STL
type: feature
priority: P0
effort: S
model: sonnet
area: [mesh]
story: US11
milestone: "VSS:M2"
sprint: "VSS:SP6"
depends_on: [38, 35]
created: 2026-10-25
---

ASCII STL parser tolerant of CRLF, tabs and odd whitespace.

**Code:** `vsslicer/modules/mesh/src/adapters/stl/` (module: `mesh`, layer: `adapters`)

## Acceptance criteria

- [x] Counts and bounding boxes equal three.js on the ASCII and CRLF fixtures
- [x] Malformed numbers give a typed error

## Tasks

- [x] Tokenizer
- [x] Tests

## Progress

Done. `parseAsciiStl(chunks)` streams lines (UTF-8 safe across chunks), reads only `vertex` lines, welds. Triangle counts, bounds equal three.js on box-ascii and box-ascii-crlf. Malformed number, wrong vertex arity, not starting with `solid`, or ending mid-triangle raise `MalformedMeshError` (line number, plain message).
Files: `src/adapters/text.ts` (shared line splitter, strict number, growable buffer), `src/adapters/stl/ascii-stl.ts`, `src/adapters/obj/obj.ts`, `src/domain/errors.ts` (+`MalformedMeshError`), `src/index.ts`, `test/text-mesh.test.ts`, CHANGELOG (Unreleased lines added, per instruction).
Verified: `pnpm lint && pnpm build && pnpm test` pass (37 tests); each fixture compared to three.js at chunk sizes 1, 3, 17, 4096, whole.
Not done: ASCII STL multi-solid files are merged into one mesh.
Changelog: VWR-40: `parseAsciiStl` and `MalformedMeshError`.

Review passed (vwr364041-reviewer): CRLF split byte-by-byte, binary-as-ascii, 1e999, 1M-triangle ASCII STL (245 MB, 64 KB chunks) parses in 5.6 s with stats equal to the binary source (closed, volume +4196); lint/build/test/prettier pass. Non-blocking: a single huge line with no newline is quadratic (textLines re-splits rest+chunk each chunk): 80 MB line took 11.5 s, 20 MB 0.7 s; a ~512M-char line would throw an untyped RangeError. Callers should apply a file-size cap (FileTooLargeError exists, unused by parsers); consider a follow-up card for a line-length cap in text.ts.
