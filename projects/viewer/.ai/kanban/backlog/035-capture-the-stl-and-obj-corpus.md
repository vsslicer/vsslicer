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
depends_on: [PLT-13, 34]
created: 2026-10-25
---

Small fixtures for the known traps, with three.js loaders and admesh as the recorded oracle.

**Code:** `vsslicer/modules/mesh/test/fixtures/` (module: `mesh`, layer: n/a (fixtures))

## Acceptance criteria

- [ ] Binary STL, ASCII STL, ASCII STL with CRLF and odd whitespace, a binary STL whose header begins with `solid`, OBJ with quads, OBJ with negative indices, OBJ with groups
- [ ] Broken files: truncated binary STL, count larger than file, NaN and infinite coordinates, OBJ face index out of range
- [ ] `PROVENANCE.md` records how each was made and the oracle counts

## Tasks

- [ ] Generate the files
- [ ] Record oracle counts
- [ ] Write PROVENANCE.md

## Progress

Not started.
