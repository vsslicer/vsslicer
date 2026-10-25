---
id: 301
title: Add MSE playback for go2rtc streams in the player
type: feature
priority: P1
effort: M
model: sonnet
area: [camera]
story: US44
milestone: "VSS:M4"
depends_on: [294, 271]
created: 2026-10-25
---

A `<video>` with MediaSource for the sidecar's MSE stream over the proxy WebSocket, with `connect-src` limited to the proxy origin.

**Code:** `vsslicer/modules/camera-extension/src/presentation/...` (module: `camera-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] CSP test still passes with the WebSocket origin listed and nothing else
- [ ] Plays the CI test RTSP stream through sidecar and proxy in the Playwright harness (H.264 browser required, skipped with a message otherwise)
- [ ] Falls back to the MJPEG output when MSE is unsupported

## Tasks

- [ ] Add the MSE player
- [ ] Update the CSP test
- [ ] Write the playback test

## Progress

Not started.
