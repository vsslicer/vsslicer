---
id: US64
title: "Repair holes and self-intersections on request"
status: reviewed
epic: VSS:E36
---

As a user whose mesh still has holes or self-intersections, I want a Repair mesh command that fills holes and removes self-intersections, so that the object becomes a closed manifold the slicer accepts.

## Acceptance criteria

- [ ] The fixtures with small holes and self-intersections become closed, manifold meshes: zero open edges and zero non-manifold edges
- [ ] Repaired volume differs from Orca's repair result on the same fixtures by less than 0.5 percent (Orca GUI result recorded once per fixture)
- [ ] A mesh that cannot be repaired (a large missing region) is reported as such and left unchanged, never half-repaired silently
- [ ] Repair runs in a worker with progress and cancel
- [ ] `repair(mesh, options)` and `repairOnLoad(mesh)` are exported for the STEP import, the cut tool and the slicer's pre-slice check
- [ ] The Orca CLI slices the repaired fixtures without repair warnings
- [ ] Verified only on fixtures (D5)

## Out of scope

- Windows SDK repair; decimation (E56); repair inside cut and boolean (E53 calls this module)
