---
id: 318
title: "Spike: manifold-3d size, load time, memory and face ids on the largest fixture"
type: spike
priority: P2
effort: M
model: opus
area: [mesh]
story: US90
milestone: "VSS:M5"
sprint: "VSS:SP47"
depends_on: [317, 275, 244]
created: 2026-10-25
---

Settles the open points before the module is built: the WASM size and load time in a worker_thread, peak memory on the largest fixture, what happens with non-manifold input, whether the output carries the originating face (`faceID`/`runOriginalID` of the MeshGL) needed to carry paint, and whether `splitByPlane` returns capped halves.

**Code:** `vsslicer/modules/core/mesh-boolean/test/spikes/` (module: `mesh-boolean`, layer: n/a (spike))

## Acceptance criteria

- [ ] Numbers recorded for WASM size, load time, and peak memory for a cut and a union on the largest fixture
- [ ] The behaviour on the open-edge fixture is recorded (error, empty result or garbage) and the refusal rule is chosen from it
- [ ] Originating face ids per output triangle are confirmed or the fallback (sampling by centroid) is chosen and recorded
- [ ] A written decision for the card owners; the spike code is not shipped

## Tasks

- [ ] Spike harness
- [ ] Measure
- [ ] Write the decision

## Progress

Not started.
