---
id: US40
title: "Camera-source author proves a source with the contract kit"
status: reviewed
epic: VSS:E38
---

As a camera-source author, I want shared stream types, local MJPEG and snapshot test servers and a contract kit, so that every camera module is proven against the same deterministic checks without a real camera.

## Acceptance criteria

- [ ] `camera-api@0.1.0` publishes stream descriptors (`mjpeg`, `jpeg-poll`, `frames`, `rtsp`, `webrtc`), camera states and typed errors on top of the printer-api `CameraSource`
- [ ] Local test servers exist in CI: an MJPEG multipart server, a snapshot server, both restartable with an auth mode
- [ ] Each `CameraSource` passes the contract test: snapshot always, live where declared, reconnect after the server restarts, auth failure surfaces as an error state
- [ ] The multipart muxer and JPEG frame check are available to the agent and the frame sources

## Out of scope

- Concrete sources (camera-mjpeg, camera-bambu, camera-webrtc)
- The proxy and the UI
