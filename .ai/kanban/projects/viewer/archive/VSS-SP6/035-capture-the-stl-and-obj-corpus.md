---
id: 35
title: Capture the STL and OBJ corpus
type: chore
priority: P0
effort: M
model: sonnet
area: [mesh]
story: US11
milestone: "VSS:M2"
sprint: "VSS:SP6"
depends_on: [PLT-13, 34]
created: 2026-10-25
---

Small fixtures for the known traps, with three.js loaders and admesh as the recorded oracle.

**Code:** `vsslicer/modules/mesh/test/fixtures/` (module: `mesh`, layer: n/a (fixtures))

## Acceptance criteria

- [x] Binary STL, ASCII STL, ASCII STL with CRLF and odd whitespace, a binary STL whose header begins with `solid`, OBJ with quads, OBJ with negative indices, OBJ with groups
- [x] Broken files: truncated binary STL, count larger than file, NaN and infinite coordinates, OBJ face index out of range
- [x] `PROVENANCE.md` records how each was made and the oracle counts

## Tasks

- [x] Generate the files
- [x] Record oracle counts
- [x] Write PROVENANCE.md

## Progress

Done. `scripts/generate-corpus.mjs` writes 14 own files (box 10x20x30, 12 triangles) to `test/fixtures/stl-obj/`; two Cura files (LGPL-3.0, commit 5bea2f86) copied unchanged. `scripts/oracle-counts.mjs` records three.js STLLoader/OBJLoader counts and bounds in `PROVENANCE.md`. admesh is not installed, so not recorded. Notable: three.js ignores trailing data (count 10 of 12) and accepts an OBJ index out of range (NaN bounds), so our parsers must reject those themselves. `check-fixtures.mjs` passes; `test/fixtures` added to `.prettierignore`.

Changelog: VWR-35: STL and OBJ fixture corpus with generator, oracle script and PROVENANCE.md.
Review passed (vwr3539-reviewer): Cura files byte-identical to Cura@5bea2f86 (LGPL-3.0 text confirmed); LGPL-3.0 into AGPL-3.0-or-later is compatible (LGPL allows conveying under GPL/AGPL; obligation: keep the LGPL notice and source-of-origin attribution with the files, which PROVENANCE.md does). Sizes 142K/32K, check-fixtures rc=0, 27 tests pass. admesh is absent, so only three.js is recorded as oracle, as the card says.
