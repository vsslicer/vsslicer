---
id: 305
title: Play WebRTC with go2rtc signalling or WHEP in the player
type: feature
priority: P2
effort: M
model: opus
area: [camera]
story: US45
milestone: "VSS:M4"
sprint: "VSS:SP33"
depends_on: [294, 277, 253, 273]
created: 2026-10-25
---

The WebRTC path in the player: peer connection, signalling through the proxy's forwarded WebSocket or WHEP POST, `connect-src` limited to the proxy origin. Adds `camera-webrtc` to the agent bundle.

**Code:** `vsslicer/modules/camera-extension/src/presentation/...` (module: `camera-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] CSP test for WebRTC: `connect-src` lists only the signalling (proxy) origin
- [ ] Plays the go2rtc CI test source over WebRTC in the harness, or the spike's finding is applied (MSE only) and recorded
- [ ] Per-camera transport is chosen from the Moonraker `service` field

## Tasks

- [ ] Add the peer connection and signalling
- [ ] Extend the bundle
- [ ] Write CSP and playback tests

## Progress

Not started.
