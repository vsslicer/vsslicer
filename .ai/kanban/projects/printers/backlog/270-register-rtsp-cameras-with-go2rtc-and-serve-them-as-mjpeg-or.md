---
id: 270
title: Register RTSP cameras with go2rtc and serve them as MJPEG or MSE
type: feature
priority: P1
effort: M
model: sonnet
area: [camera, daemon]
story: US44
milestone: "VSS:M4"
sprint: "VSS:SP21"
depends_on: [269, 251, 250]
created: 2026-10-25
---

When a source declares `rtsp`, register it in the sidecar and expose the sidecar's MJPEG or MSE output through the proxy; without go2rtc, offer a snapshot if the printer has one, with an explanation.

**Code:** `vsslicer/modules/printer-agent/src/application/...` (module: `printer-agent`, layer: `application`)

## Acceptance criteria

- [ ] A test RTSP stream (go2rtc or ffmpeg test source in CI) plays as MJPEG through the proxy and as MSE over the forwarded WebSocket
- [ ] Without go2rtc installed the result is the 'needs go2rtc' state, and a snapshot when the source offers one
- [ ] Stopping the viewer unregisters the stream from the sidecar

## Tasks

- [ ] Write register and unregister
- [ ] Expose MJPEG and MSE through the proxy
- [ ] Write the CI test stream setup

## Progress

Not started.
