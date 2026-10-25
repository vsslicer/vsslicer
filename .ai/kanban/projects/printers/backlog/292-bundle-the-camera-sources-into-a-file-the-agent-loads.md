---
id: 292
title: Bundle the camera sources into a file the agent loads
type: chore
priority: P1
effort: S
model: sonnet
area: [camera, daemon]
story: US42
milestone: "VSS:M4"
sprint: "VSS:SP24"
depends_on: [291, 260, 267]
created: 2026-10-25
---

Bundle camera-mjpeg and camera-bambu into one agent-loadable file inside the VSIX, as the Bambu extension does for its adapter (PRN-49/50).

**Code:** `vsslicer/modules/camera-extension/` (module: `camera-extension`, layer: `n/a (build)`)

## Acceptance criteria

- [ ] The VSIX contains the bundle and the VSIX content assertion lists it; a node process loads it and sees both registration descriptors
- [ ] Licence and size-budget checks pass

## Tasks

- [ ] Add the bundle step
- [ ] Extend the VSIX assertion

## Progress

Not started.
