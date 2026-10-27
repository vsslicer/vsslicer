---
id: 277
title: Decode and encode the hex paint string byte-identically
type: feature
priority: P2
effort: M
model: opus
area: [mesh, painting]
story: US80
milestone: "VSS:M5"
sprint: "VSS:SP42"
depends_on: [276, 273]
created: 2026-10-25
---

Decodes the per-triangle hex string stored on `<triangle>` into the tree and encodes it back. Ported from the serialise and deserialise functions of `OrcaSlicer@09aa0114:src/libslic3r/TriangleSelector.cpp` and `.hpp` (AGPL-3.0, D2; cross-check `PrusaSlicer@30ef591:src/slic3r-domain/include/Slic3r/Domain/TriangleSelector.hpp`).

**Code:** `vsslicer/modules/core/mesh/src/domain/paint/codec/` (module: `mesh`, layer: `domain`)

## Acceptance criteria

- [ ] Every string in the Orca, Bambu Studio and PrusaSlicer 2.9 fixtures decodes and re-encodes to the same string, byte for byte
- [ ] Colours above the fourth filament (the extra nibble) round-trip; the empty string means unpainted
- [ ] A malformed string gives a typed error naming the triangle index and the offset
- [ ] Notice and `Ported from` line present

## Tasks

- [ ] Port decode
- [ ] Port encode
- [ ] Fixture round-trip test
- [ ] Malformed-string tests

## Progress

Not started.
