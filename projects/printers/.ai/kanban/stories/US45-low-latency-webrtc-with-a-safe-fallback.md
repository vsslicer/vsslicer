---
id: US45
title: "Low-latency WebRTC cameras with a safe fallback"
status: reviewed
epic: VSS:E39
---

As a user with a go2rtc, camera-streamer or MediaMTX camera, I want WebRTC playback that falls back to MJPEG when it cannot connect, so that I get low latency without ever seeing a blank player.

## Acceptance criteria

- [ ] Sources are selected from the Moonraker webcam `service` field (`webrtc-go2rtc`, `webrtc-camerastreamer`, `webrtc-mediamtx`), using go2rtc WS signalling or WHEP; the H2C uses the same path when the sidecar runs
- [ ] A WebRTC contract test passes against a go2rtc test instance in CI and a WHEP test server
- [ ] ICE failure falls back to MJPEG with a visible note; a setting pins a camera to MJPEG
- [ ] CSP test: `connect-src` lists only the signalling origin
- [ ] WebRTC in a webview is verified on desktop VS Code on one platform; remote hosts recorded as unverified if it fails

## Out of scope

- Recording live streams
- Cloud relays
