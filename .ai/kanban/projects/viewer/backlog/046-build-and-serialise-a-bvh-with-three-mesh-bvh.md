---
id: 46
title: Build and serialise a BVH with three-mesh-bvh
type: feature
priority: P0
effort: M
model: opus
area: [mesh]
story: US14
milestone: "VSS:M2"
sprint: "VSS:SP6"
depends_on: [42]
created: 2026-10-25
---

Builds the BVH in a worker and round-trips it as transferable buffers so it is built once.

**Code:** `vsslicer/modules/mesh/src/adapters/bvh/` (module: `mesh`, layer: `adapters`)

## Acceptance criteria

- [ ] `buildBvh`, `serialiseBvh` and `deserialiseBvh` exist; the deserialised BVH gives identical raycasts
- [ ] Raycasts agree with brute force on 10,000 random rays per fixture
- [ ] No `SharedArrayBuffer` required

## Tasks

- [ ] Wrapper
- [ ] Serialise
- [ ] Brute-force comparison

## Progress

Not started.
