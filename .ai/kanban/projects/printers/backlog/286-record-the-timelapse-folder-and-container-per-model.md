---
id: 286
title: Record the timelapse folder and container per model
type: feature
priority: P2
effort: S
model: sonnet
area: [camera, bambu]
story: US47
milestone: "VSS:M4"
sprint: "VSS:SP33"
depends_on: [285, 262]
created: 2026-10-25
---

The per-model capability table for timelapses, from the spike.

**Code:** `vsslicer/modules/camera-bambu/src/domain/...` (module: `camera-bambu`, layer: `domain`)

## Acceptance criteria

- [ ] Table-driven test: H2C resolves to the verified folder and container; unverified models carry an 'unverified' flag; an unknown model returns 'no timelapse folder known'

## Tasks

- [ ] Write the table
- [ ] Write the tests

## Progress

Not started.
