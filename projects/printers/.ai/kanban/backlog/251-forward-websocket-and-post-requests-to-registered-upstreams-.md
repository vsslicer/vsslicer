---
id: 251
title: Forward WebSocket and POST requests to registered upstreams only
type: feature
priority: P1
effort: M
model: opus
area: [camera, daemon]
story: US41
milestone: "VSS:M4"
depends_on: [249]
created: 2026-10-25
---

MSE (go2rtc WebSocket) and WebRTC signalling (go2rtc WS, WHEP POST) reach the webview through the proxy origin; only upstreams registered by `camera.open` are forwarded to, so the proxy is not an open relay; security-sensitive.

**Code:** `vsslicer/modules/printer-agent/src/adapters/...` (module: `printer-agent`, layer: `adapters`)

## Acceptance criteria

- [ ] A WebSocket and a POST to a registered upstream are forwarded and answered (local echo server); a request to any other host or path returns 404
- [ ] Redirects from the upstream are not followed outside the registered upstream
- [ ] Closing the viewer closes the upstream socket (socket count test)

## Tasks

- [ ] Write the WS and POST forwarders
- [ ] Write the registered-upstream check
- [ ] Write tests

## Progress

Not started.
