---
id: 274
title: Map Moonraker webcam services to WebRTC descriptors and build signalling messages
type: feature
priority: P2
effort: M
model: sonnet
area: [camera, moonraker]
story: US45
milestone: "VSS:M4"
sprint: "VSS:SP34"
depends_on: [272, 246]
created: 2026-10-25
---

From the Moonraker webcam `service` field (`webrtc-go2rtc`, `webrtc-camerastreamer`, `webrtc-mediamtx`) to `webrtc` descriptors with an MJPEG fallback, plus the go2rtc `webrtc/offer|answer|candidate` message builders and the WHEP request builder. The same helpers describe the H2C stream served by the E38 sidecar.

**Code:** `vsslicer/modules/camera-webrtc/src/domain/...` (module: `camera-webrtc`, layer: `domain`)

## Acceptance criteria

- [ ] Recorded webcam lists map each service to the right signalling protocol and URL; a webcam also offering MJPEG carries it as `fallback`
- [ ] Message builders produce the documented go2rtc JSON and the WHEP POST (golden tests); a sidecar stream name maps to a go2rtc descriptor
- [ ] An unknown service is skipped, not thrown

## Tasks

- [ ] Write the service mapper
- [ ] Write the message builders
- [ ] Write golden tests

## Progress

Not started.
