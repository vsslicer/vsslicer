---
id: US13
title: "Deduplicate vertices and report mesh health"
status: reviewed
epic: VSS:E9
---

As a user, I want meshes compacted to indexed form and warned about open or non-manifold edges, so that I know a model is broken before I slice it.

## Acceptance criteria

- [ ] Deduplicated meshes are topologically identical to the source (same triangle set after re-expansion); property test on random meshes; about 24 bytes per triangle
- [ ] `MeshStats` reports triangle count, bounding box, volume, open-edge and non-manifold-edge counts and degenerate triangles
- [ ] Open-edge and non-manifold counts match admesh's report on the same fixtures (admesh CLI in CI)
- [ ] `fromArrays` turns E8's typed arrays for a 3MF object into an `IndexedMesh`
- [ ] Verified only on fixtures (D5)

## Out of scope

- Repair (E36): this story only reports
