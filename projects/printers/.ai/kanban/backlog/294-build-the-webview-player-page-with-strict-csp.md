---
id: 294
title: Build the webview player page with strict CSP
type: feature
priority: P1
effort: M
model: sonnet
area: [camera]
story: US42
milestone: "VSS:M4"
depends_on: [291, PLT-32, PLT-36, PLT-37]
created: 2026-10-25
---

The player in a webview built with `@vsslicer/webview-kit`: `<img>` for MJPEG and remuxed frames, states (connecting, live, error, hint), CSP limited to the proxy origin. Pushed frames reach the player as the proxy's MJPEG remux; no `<canvas>` path (kept simple).

**Code:** `vsslicer/modules/camera-extension/src/presentation/...` (module: `camera-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] CSP test: the HTML has a meta CSP with `default-src 'none'`, `img-src` and `connect-src` listing only the proxy origin, no `unsafe-inline`
- [ ] Playwright stub test: the `<img>` shows a frame from the local MJPEG server through a stub proxy and shows the error state when it stops
- [ ] The webview loads nothing from the LAN directly (network log assertion)

## Tasks

- [ ] Build the page with createWebviewHtml
- [ ] Write states and error display
- [ ] Write the CSP and stub tests

## Progress

Not started.
