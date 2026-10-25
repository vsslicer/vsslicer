---
id: 308
title: Add timelapse calls to the camera service
type: feature
priority: P2
effort: S
model: sonnet
area: [camera]
story: US48
milestone: "VSS:M4"
sprint: "VSS:SP33"
depends_on: [293, 290]
created: 2026-10-25
---

List, download (with progress and cancel) and render requests for a printer's timelapses over the agent.

**Code:** `vsslicer/modules/camera-extension/src/application/...` (module: `camera-extension`, layer: `application`)

## Acceptance criteria

- [ ] Against the agent with the fake provider: list, download with progress, cancel leaves no partial file
- [ ] Registers camera-timelapse and the Bambu timelapse provider in the bundle

## Tasks

- [ ] Extend the service
- [ ] Extend the bundle
- [ ] Write tests

## Progress

Not started.
