---
id: US12
title: "Parse OBJ into indexed meshes"
status: reviewed
epic: VSS:E9
---

As a user opening an OBJ, I want geometry and groups read, so that multi-part OBJ files show as separate parts.

## Acceptance criteria

- [ ] Fixture OBJ files with quads, negative indices and groups parse to the expected triangle counts and bounding boxes (three.js loader as oracle); groups become parts; `.mtl` is ignored
- [ ] An OBJ face index out of range gives a typed error and a fixture
- [ ] Verified only on fixtures (D5)

## Out of scope

- Materials and textures
