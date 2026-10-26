---
id: 141
title: Generate the VFA test and its sweep
type: feature
priority: P2
effort: S
model: sonnet
area: [calibration]
story: US44
milestone: "VSS:M5"
sprint: "VSS:SP38"
depends_on: [133, 134, 135]
created: 2026-10-25
---

Tower whose outer-wall speed steps per block so a user can see vertical fine artifacts; the picked block gives a resonance-avoidance speed written to `outer_wall_speed`.

**Code:** `vsslicer/modules/calibration/src/domain/...` (module: `calibration`, layer: `domain`)

## Acceptance criteria

- [ ] The plan sweeps outer-wall speed in steps; the parser detects the speed per block in recorded G-code
- [ ] The target key and the meaning of the pick are documented (see the owner question in the epic report)
- [ ] The mesh is manifold

## Tasks

- [ ] Mesh
- [ ] Plan
- [ ] Tests

## Progress

Not started.
