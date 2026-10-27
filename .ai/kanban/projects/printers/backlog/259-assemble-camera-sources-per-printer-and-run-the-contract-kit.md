---
id: 259
title: Assemble camera sources per printer and run the contract kit
type: feature
priority: P1
effort: M
model: sonnet
area: [camera]
story: US42
milestone: "VSS:M4"
sprint: "VSS:SP38"
depends_on: [257, 258, 256]
created: 2026-10-25
---

The module's registration entry: the `CameraSource` for a printer from discovered and manual cameras, declaring snapshot and live per camera.

**Code:** `vsslicer/modules/camera/mjpeg/src/application/...` (module: `camera-mjpeg`, layer: `application`)

## Acceptance criteria

- [ ] The camera-api contract kit passes for an MJPEG camera and for a snapshot-only camera against the local servers
- [ ] A printer with two cameras lists both with stable ids; a manual URL is added to the list
- [ ] The module exports the registration descriptor the agent loader needs (module path and id)

## Tasks

- [ ] Write the source factory
- [ ] Write the descriptor
- [ ] Run the contract kit

## Progress

Not started.
