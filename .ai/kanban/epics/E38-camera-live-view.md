---
id: E38
title: Watch printer cameras live in vsslicer.camera, starting with the H2C
status: reviewed
initiative: I7
project: PRN
order: 7
depends_on: [E20, E21, E22, E23, E2]
rows: ["§12 Live camera view in the app"]
---

Delivers `vsslicer.camera`: a camera panel and sidebar view that shows a printer's camera live in VS
Code. It starts with the owner's Bambu H2C (RTSPS, D3 consequence for I7) and covers MJPEG and
snapshot cameras of Klipper, OctoPrint and PrusaLink, and the pushed JPEG frames of Bambu A1/P1. All
camera traffic goes through a loopback proxy in `vsslicer-agent`, because printers need TLS with
self-signed certificates and credentials a webview cannot send (`remote-camera.md` §2).

## Scope

In:
- `CameraSource` implementations (E20 interface): `mjpeg` and `jpeg-poll` from Moonraker
  `/server/webcams/list`, OctoPrint settings URLs, PrusaLink `/api/v1/cameras/{id}/snap`, manual
  URL; `bambu-jpeg` (TLS TCP 6000, 80-byte auth packet, framed JPEG) for A1/P1; `rtsp` for X1, P2S
  and H2 (H2C) from the MQTT `ipcam.rtsp_url`, with a "turn on LAN Mode Liveview" hint when it reads
  `disable`.
- Loopback proxy in the agent: 127.0.0.1, random port, per-session token in the path, serving
  `/camera/<id>/stream` (multipart passthrough) and `/snapshot`, adding auth; reached by the webview
  through `asExternalUri`/`portMapping`.
- RTSPS for the H2C through an optional go2rtc sidecar (MIT): downloaded on request from its GitHub
  release with a pinned version and SHA-256, started by the agent bound to 127.0.0.1 with
  `api.local_auth`, re-served as MJPEG or MSE. Without go2rtc, RTSP cameras show snapshots only if the
  printer offers them, with an explanation.
- Webview player (`@vsslicer/webview-kit` CSP helper, E2): `<img>` for MJPEG, `<canvas>` for
  pushed frames, `<video>` with MSE; CSP limited to the proxy origin, no `unsafe-inline`.
- "Open camera" from the Printers tree; snapshot to file.

Out: WebRTC (E39), timelapse retrieval (E39), cloud relays (TUTK/Agora, never), Prusa Connect
cameras (cloud), recording.

Code: new TypeScript; the port-6000 framing follows ha-bambulab (MIT) and OpenBambuAPI facts (no
GFDL prose); Mainsail/Fluidd (GPL) read only.

## Feature-matrix rows

- §12 Live camera view in the app (P1): done when the H2C camera plays live in VS Code with the
  latency and bandwidth recorded, and MJPEG, snapshot and A1/P1-style frame sources pass against the
  local test servers.

## Acceptance criteria

- [ ] Local test servers in CI: an MJPEG multipart server, a snapshot server, a fake port-6000 TLS
      server replaying recorded frames, and an RTSP test stream (go2rtc or ffmpeg test source)
- [ ] Each `CameraSource` passes a camera contract test (snapshot always, live where declared,
      reconnect after server restart, auth failure surfaces as an error state)
- [ ] Proxy tests: token required, bound to 127.0.0.1 only, CORS not opened, stream closes when the
      webview closes (no leaked sockets after 20 open/close cycles)
- [ ] CSP test: the webview HTML has a meta CSP with `default-src 'none'` and only the proxy origin
- [ ] go2rtc download verifies SHA-256; a wrong checksum refuses to run; the sidecar exits with the
      agent
- [ ] On the H2C (firmware recorded): live view with LAN Mode Liveview on, measured glass-to-glass
      latency and bandwidth recorded in `docs/` with date; the "turn on Liveview" hint with it off
- [ ] Remote-SSH: the camera plays from a remote workspace (proxy on the UI machine; manual check)
- A1/P1, X1, Moonraker, OctoPrint and PrusaLink cameras on test servers and recordings only (D5).

## Dependencies

- Needs E20 (`CameraSource`), E21 (Bambu `ipcam` state, access code), E22 (agent hosts the
  proxy and sidecar), E23 (open adapters' `webcams()`), E2 (CSP helper, message transport).
- Exposes `CameraView.open(source)` and the proxy to E39 (WebRTC and timelapse), E47 (fleet
  view thumbnails), and any extension that wants a camera tile.

## Risks and spikes

- H2C camera path unverified (`remote-camera.md` Open questions): spike on the H2C (1 day) first:
  RTSPS URL, whether Developer Mode is needed, codec (H.264 expected), and whether go2rtc connects
  (one user report of refused connections on 322).
- RTSP without go2rtc would need ffmpeg or an H.264 decoder in Node: rejected as too heavy; the
  sidecar is PRN's one innovation token.
- Webview Local Network Access prompts in newer Chromium: the proxy on loopback avoids LAN fetches
  from the webview; verified with the shipped Electron.
- VSCodium builds without proprietary codecs lose H.264: documented requirement for I11.

## Eng review

- Scope challenge: live view only; WebRTC and timelapse moved to E39 to keep this epic at about
  four sprints with the H2C as the first oracle.
- Blast radius: frames flow agent to webview, never through the extension host thread; a stuck
  camera cannot block printer status (separate sockets and timeouts).
- Reversibility: go2rtc is opt-in and removable; without it the epic still serves MJPEG and frames.
- Security: proxy token, loopback bind and checksum-pinned sidecar each have a test.
