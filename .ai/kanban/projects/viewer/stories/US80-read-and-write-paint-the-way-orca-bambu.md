---
id: US80
title: "Read and write paint the way Orca, Bambu Studio and PrusaSlicer do"
status: reviewed
epic: VSS:E52
---

As the author of the painting tools and of the cut and multi-material features, I want a paint model that decodes and encodes the hex strings of the upstream tools exactly, so that paint written by any of them survives a round trip through VSSlicer unchanged.

## Acceptance criteria

- [ ] Serialised paint strings from the Orca, Bambu Studio and PrusaSlicer 2.9 fixtures decode and re-encode byte-identically, including colours above the fourth filament
- [ ] A malformed string gives a typed error naming the triangle and offset
- [ ] The model is ported from TriangleSelector with notices and a `Ported from` line, with PrusaSlicer's version as the cross-check
- [ ] The `PaintLayer` model and serialiser are exported by the mesh library for the cut tools and for multi-material assignment
- [ ] Verified only on fixtures (D5)

## Out of scope

- Painting tools (US81, US82, US83)
- Fuzzy-skin and texture painting (P3, E56)
