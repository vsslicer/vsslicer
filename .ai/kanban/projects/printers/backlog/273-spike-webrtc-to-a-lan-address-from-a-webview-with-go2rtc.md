---
id: 273
title: "Spike: WebRTC to a LAN address from a webview with go2rtc"
type: spike
priority: P2
effort: M
model: opus
area: [camera]
story: US45
milestone: "VSS:M4"
sprint: "VSS:SP34"
depends_on: [PLT-14, PLT-32, PLT-37]
created: 2026-10-25
---

One day: does an `RTCPeerConnection` in a VS Code webview reach go2rtc on a LAN address, with signalling through a loopback WebSocket? If not, the fallback is MSE through the proxy.

**Code:** `vsslicer/modules/camera/webrtc/` (module: `camera-webrtc`, layer: `n/a (docs)`)

## Acceptance criteria

- [ ] Written up in `docs/` with VS Code version, OS and date: connected or not, the ICE candidates used, and what failed
- [ ] Tested in the sample webview with a go2rtc test source; Remote-SSH result recorded or marked untested
- [ ] A clear recommendation: WebRTC supported, supported on some hosts, or MSE only

## Tasks

- [ ] Build the throwaway webview page
- [ ] Run against go2rtc
- [ ] Write the findings

## Progress

Not started.
