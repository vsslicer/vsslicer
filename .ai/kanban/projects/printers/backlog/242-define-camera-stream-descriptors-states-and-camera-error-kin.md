---
id: 242
title: "Define camera stream descriptors, states and camera error kinds"
type: feature
priority: P1
effort: M
model: opus
area: [camera, api]
story: US40
milestone: "VSS:M4"
sprint: "VSS:SP28"
depends_on: [241, 14]
created: 2026-10-25
---

The types every camera module and the proxy share, refining the `CameraSource` port of `printer-api` (PRN-6): stream kinds `mjpeg`, `jpeg-poll`, `frames`, `rtsp`, `webrtc` (go2rtc WS or WHEP signalling), an optional `fallback` descriptor, camera states, typed errors and the `AuthorizedFetch` type the agent hands to HTTP camera modules.

**Code:** `vsslicer/modules/common/camera-api/src/domain/...` (module: `camera-api`, layer: `domain`)

## Acceptance criteria

- [ ] Types only plus pure helpers; type tests compile a source that declares snapshot only and one that declares snapshot and live, and fail when a required member is removed
- [ ] Error kinds cover auth failure, unreachable, TLS, stream ended and `liveview-disabled`, each with a user-facing message key (unit test)
- [ ] A `WebcamRecord` type for the Moonraker webcam list entry (including `service`) is exported for camera-mjpeg and camera-webrtc
- [ ] The `CameraSource` shape is checked against the printer-api types in a compile test (no duplicate of printer-api types)

## Tasks

- [ ] Write the descriptors, states and errors
- [ ] Write AuthorizedFetch and WebcamRecord
- [ ] Add type tests

## Progress

Not started.
