---
id: 258
title: "Open the MJPEG upstream with auth, reconnect and error states"
type: feature
priority: P1
effort: M
model: sonnet
area: [camera, moonraker, octoprint]
story: US42
milestone: "VSS:M4"
sprint: "VSS:SP28"
depends_on: [255, 246]
created: 2026-10-25
---

Open the printer's MJPEG stream with credentials, hand the multipart body to the proxy, and reconnect with backoff.

**Code:** `vsslicer/modules/camera-mjpeg/src/adapters/...` (module: `camera-mjpeg`, layer: `adapters`)

## Acceptance criteria

- [ ] Streams from the camera-api MJPEG server; a server restart is followed by a reconnect without the caller doing anything
- [ ] Auth failure and TLS errors (self-signed printer certificate rejected unless the connection allows it) map to typed errors
- [ ] Cancelling closes the socket (socket count test)

## Tasks

- [ ] Write the upstream opener
- [ ] Write backoff and error mapping
- [ ] Write tests

## Progress

Not started.
