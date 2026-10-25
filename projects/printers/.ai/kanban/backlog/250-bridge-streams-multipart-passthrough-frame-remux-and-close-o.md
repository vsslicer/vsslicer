---
id: 250
title: "Bridge streams: multipart passthrough, frame remux and close on disconnect"
type: feature
priority: P1
effort: M
model: sonnet
area: [camera, daemon]
story: US41
milestone: "VSS:M4"
depends_on: [249, 248, 246]
created: 2026-10-25
---

Connect the proxy to a source: `mjpeg` passes the upstream multipart through, `jpeg-poll` and `frames` are remuxed with the camera-api muxer, and the upstream closes when the viewer disconnects.

**Code:** `vsslicer/modules/printer-agent/src/adapters/...` (module: `printer-agent`, layer: `adapters`)

## Acceptance criteria

- [ ] MJPEG, jpeg-poll and frames sources each stream through the proxy against the camera-api test servers and a recorded frame replay
- [ ] Closing the viewer socket closes the upstream within 1 s (test counts open sockets)
- [ ] A source error mid-stream ends the response and reports the camera state (test with a dropped server)

## Tasks

- [ ] Write the passthrough and remux paths
- [ ] Wire close on disconnect
- [ ] Write tests

## Progress

Not started.
