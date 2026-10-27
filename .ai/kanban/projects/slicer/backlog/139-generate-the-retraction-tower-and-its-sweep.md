---
id: 139
title: Generate the retraction tower and its sweep
type: feature
priority: P2
effort: S
model: sonnet
area: [calibration]
story: US43
milestone: "VSS:M5"
sprint: "VSS:SP40"
depends_on: [133, 134, 135]
created: 2026-10-25
---

Tower with one block per retraction length; target key `retraction_length`.

**Code:** `vsslicer/modules/core/calibration/src/domain/...` (module: `calibration`, layer: `domain`)

## Acceptance criteria

- [ ] Plan blocks cover the default range in the right order; the layer range of block N starts on a layer boundary (regression test from CAL4)
- [ ] The mesh is manifold
- [ ] Firmware variant gives its retraction command or a refusal

## Tasks

- [ ] Mesh
- [ ] Plan
- [ ] Tests

## Progress

Not started.
