---
id: US14
title: "Build a transferable BVH for picking"
status: reviewed
epic: VSS:E9
---

As the author of picking, measure and painting, I want a BVH built once in a worker and transferred, so that raycasts are fast without rebuilding.

## Acceptance criteria

- [ ] `buildBvh` uses three-mesh-bvh in a worker and `serialise`/`deserialise` round-trips it as transferable buffers
- [ ] BVH raycasts agree with brute-force raycasts on 10,000 random rays per fixture
- [ ] Single-worker build is the baseline (no `SharedArrayBuffer`)
- [ ] Verified only on fixtures (D5)

## Out of scope

- Parallel BVH build
