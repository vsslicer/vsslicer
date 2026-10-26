---
id: 299
title: Verify the camera in a Remote-SSH workspace
type: chore
priority: P1
effort: S
model: sonnet
area: [camera]
story: US41
milestone: "VSS:M4"
sprint: "VSS:SP35"
depends_on: [298]
created: 2026-10-25
---

Manual check that the proxy on the UI machine serves a camera to a window attached to a remote workspace.

**Code:** `vsslicer/modules/camera-extension/` (module: `camera-extension`, layer: `n/a (manual verification)`)

## Acceptance criteria

- [ ] Recorded in `docs/` with VS Code version and OS: the MJPEG test camera plays in a Remote-SSH window; failures are written down with the reason
- [ ] The proxy is confirmed bound to loopback on the UI machine during the run

## Tasks

- [ ] Set up a Remote-SSH window
- [ ] Play the test camera
- [ ] Write the result

## Progress

Not started.
