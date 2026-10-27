---
id: 257
title: Fetch snapshots and run the jpeg-poll source
type: feature
priority: P1
effort: M
model: sonnet
area: [camera, moonraker, octoprint, prusalink]
story: US42
milestone: "VSS:M4"
sprint: "VSS:SP28"
depends_on: [255, 246]
created: 2026-10-25
---

Snapshot fetch with auth and timeout, and a polling live source for cameras that offer only snapshots (PrusaLink `/snap`).

**Code:** `vsslicer/modules/camera/mjpeg/src/adapters/...` (module: `camera-mjpeg`, layer: `adapters`)

## Acceptance criteria

- [ ] Snapshot returns a whole JPEG (frame check); a non-JPEG body is an error
- [ ] jpeg-poll yields frames at the configured interval and stops when cancelled (fake timers)
- [ ] Wrong credentials surface as the auth-failure state

## Tasks

- [ ] Write snapshot fetch
- [ ] Write the poller
- [ ] Write tests

## Progress

Not started.
