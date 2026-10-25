---
id: US3
title: "Read the 3MF core model and Production sub-models to the specification"
status: reviewed
epic: VSS:E8
---

As a library consumer, I want objects, components, build items, transforms, materials and metadata from the core model and Production sub-models as typed structures with meshes as typed arrays, so that any conforming 3MF opens correctly.

## Acceptance criteria

- [ ] Objects, components, build items, transforms, base materials, colour groups and metadata are read; meshes are `Float32Array` vertices and `Uint32Array` triangles
- [ ] Production `p:path` references resolve across sub-model parts; a path to a missing part gives a typed error and message
- [ ] The 3MF Consortium `test_suites` core and Production cases pass: positives parse, negatives fail with the expected error class
- [ ] lib3mf WASM run in CI agrees on object, triangle and build-item counts
- [ ] Verified only on fixtures (D5)

## Out of scope

- Slice, Beam Lattice, Volumetric, Boolean, Displacement and Secure Content extensions beyond detection (US7)
