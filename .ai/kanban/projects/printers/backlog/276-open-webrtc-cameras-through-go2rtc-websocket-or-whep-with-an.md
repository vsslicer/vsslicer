---
id: 276
title: Open WebRTC cameras through go2rtc WebSocket or WHEP with an MJPEG fallback
type: feature
priority: P2
effort: M
model: sonnet
area: [camera]
story: US45
milestone: "VSS:M4"
sprint: "VSS:SP34"
depends_on: [274, 275, 246]
created: 2026-10-25
---

The `webrtc` `CameraSource`: probe the signalling endpoint, relay one offer/answer exchange, and declare the fallback so the player can switch.

**Code:** `vsslicer/modules/camera/webrtc/src/adapters/...` (module: `camera-webrtc`, layer: `adapters`)

## Acceptance criteria

- [ ] Contract test against the go2rtc test instance: a canned SDP offer over WebSocket returns an answer; the WHEP server returns 201 with an answer
- [ ] An unreachable or refusing signalling endpoint returns the typed error and the descriptor's fallback is offered
- [ ] Snapshot works through the camera's snapshot URL or the go2rtc frame endpoint

## Tasks

- [ ] Write the WS and WHEP clients
- [ ] Write the probe and fallback offer
- [ ] Run the tests

## Progress

Not started.
