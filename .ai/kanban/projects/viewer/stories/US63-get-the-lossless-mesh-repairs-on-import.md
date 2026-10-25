---
id: US63
title: "Get the lossless mesh repairs on import"
status: reviewed
epic: VSS:E36
---

As a user opening a broken STL, I want near-duplicate vertices merged, degenerate and duplicate faces removed and normals fixed on load, so that the model slices without me running a repair tool.

## Acceptance criteria

- [ ] Load-time repair does only the lossless admesh-equivalent steps: exact and tolerant vertex merging, degenerate and duplicate face removal, normal orientation, neighbour connectivity
- [ ] The broken-mesh fixtures (open edges, flipped normals, duplicate faces, zero-area slivers) lose those defects, checked by the mesh statistics and by admesh's report as an external oracle
- [ ] A setting turns load-time repair off
- [ ] Runs on Linux, macOS and Windows; verified only on fixtures (D5)

## Out of scope

- Hole filling and self-intersection removal (US64)
