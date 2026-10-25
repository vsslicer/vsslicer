# Remote camera streams

Researched 2026-10-25. Sources: go2rtc README (v1.9.15 released 2026-10-25, https://github.com/AlexxIT/go2rtc), camera-streamer README/docs (https://github.com/ayufan/camera-streamer), crowsnest README, Moonraker webcam API (https://moonraker.readthedocs.io/en/latest/external_api/webcams/), moonraker-timelapse (`component/timelapse.py` and `docs/` on `main`, as read 2026-10-25; the commit hash was not recorded, so line numbers may drift), OctoPrint docs, Octolapse README, OpenBambuAPI `video.md`/`ftp.md` (https://github.com/Doridian/OpenBambuAPI), ha-bambulab `bambu_client.py`, Prusa Connect camera docs, VS Code `vscode.d.ts` and webview guide, Electron `build/args/all.gn`. Local clones (read only): mainsail@03a4d7b, fluidd@b36a497, vscode@4ef6bab, OpenBambuAPI@cc383a2, ha-bambulab@0e027ff, Prusa-Link-Web@a67f306. Raw notes: `.reference/notes/VSS-11-remote-camera.md`. Latency and bandwidth figures not backed by a measurement are marked (unverified); nothing here was measured on hardware.

## Findings

### 1. Stream types

| Type | Who produces it | URL / protocol | Notes |
|---|---|---|---|
| MJPEG | mjpg-streamer / ustreamer via crowsnest, OctoPrint `webcam.stream`, camera-streamer | `/?action=stream` (multipart), `/?action=snapshot` (JPEG) per OctoPrint config docs (https://docs.octoprint.org/en/master/configuration/config_yaml.html); camera-streamer `:8080/stream` and `/snapshot` (https://raw.githubusercontent.com/ayufan/camera-streamer/main/docs/streaming.md) | Universal default. Moonraker `service` default is `mjpegstreamer`. |
| WebRTC | camera-streamer (`:8080/webrtc`, libdatachannel, needs H.264 output), go2rtc (`/api/ws` JSON signalling, `/api/webrtc`), MediaMTX (WHEP) | go2rtc WS messages `webrtc/offer`, `webrtc/answer`, `webrtc/candidate` (https://raw.githubusercontent.com/AlexxIT/go2rtc/master/internal/api/ws/README.md); Fluidd `WebrtcGo2RtcCamera.vue:60`, `WebrtcMediamtxCamera.vue:126` (fluidd@b36a497) | go2rtc ports: API 1984, RTSP 8554, WebRTC 8555 (README). Signalling over HTTP/WS, media over UDP/TCP 8555, so it needs a path to the printer host, not just the HTTP port. |
| MSE / fMP4 | go2rtc (`/api/stream.mp4`, WS `mse` message) | MIME and codec returned by server | Chrome/Electron have MSE; medium latency per go2rtc table. |
| HLS | go2rtc `/api/stream.m3u8`; camera-streamer `/video` (picks mp4 or hls) | | Highest latency; Chromium lacks native HLS, needs hls.js or MSE. Mainsail has `hlsstream` service. |
| RTSP | camera-streamer `rtsp://ip:8554/stream.h264` (`--rtsp-port`), go2rtc 8554, IP cameras, Bambu X1 | | Not playable in a browser or webview; needs a gateway (go2rtc or ffmpeg) to WebRTC/MSE/MJPEG. |

Front-end service vocabulary (what Moonraker-hosted printers can already advertise): Mainsail `GuiWebcamStateWebcam.service` = `grid, hlsstream, html-video, iframe, jmuxer-stream, mjpegstreamer, mjpegstreamer-adaptive, uv4l-mjpeg, webrtc-camerastreamer, webrtc-janus, webrtc-mediamtx` (mainsail@03a4d7b:src/store/gui/webcams/types.ts:8-20). Fluidd adds `webrtc-go2rtc` and `ipstream` (fluidd@b36a497:src/components/settings/cameras/CameraConfigDialog.vue:82-87).

**Moonraker webcam API** (https://moonraker.readthedocs.io/en/latest/external_api/webcams/): `GET /server/webcams/list`, `GET|POST|DELETE /server/webcams/item`, `POST /server/webcams/test`. Fields: `name`, `uid`, `service` (free string, default `mjpegstreamer`), `stream_url`, `snapshot_url` (either may be relative to the Moonraker host), `target_fps`, `flip_*`, `rotation`, `aspect_ratio`, `extra_data`, `source` (`database` or `config`). Moonraker only stores this metadata; crowsnest runs the streamers. Webcams can also be declared in `moonraker.conf` as `[webcam name]` sections (https://moonraker.readthedocs.io/en/latest/configuration/).

**crowsnest** (GPL-3.0): config manager that runs ustreamer or camera-streamer per camera; Raspberry Pi 5 works with ustreamer only per its README (https://github.com/mainsail-crew/crowsnest). **camera-streamer** (GPL-3.0, Debian Bookworm, kernel >= 6.1 for current branch; Bullseye needs v0.3.x): MJPEG plus H.264, hardware accelerated on Raspberry Pi.

**go2rtc** (MIT; v1.9.15 on 2026-10-25): inputs include RTSP, MJPEG, HLS files, ONVIF, WHEP, `ffmpeg`/`exec` scripts, Home Assistant; outputs include RTSP, WebRTC, MSE MP4, HLS, MJPEG, JPEG (`/api/frame.jpeg`). It documents no native Bambu source (README); Bambu X1 RTSPS is reported working through it by users (https://forum.bambulab.com/t/web-browser-access-of-camera-feed/21703), and one user on v1.9.14 got connection refused on 322 (same thread, thread unresolved). It has no auth by default; `api.local_auth` exists and the README advises a reverse proxy.

**Bambu Lab**, protocol per OpenBambuAPI `video.md` (undated; firmware stated only where noted):
- X1 series and P2S: RTSPS, TLS, `rtsps://bblp:<access code>@<ip>:322/streaming/live/1`.
- A1 and P1 series: proprietary TLS TCP server on port 6000 delivering 1280x720 JPEG frames. Auth packet is 80 bytes, little-endian: 16-byte header (payload size 0x40, type 0x3000, flags 0, zero), username 32 bytes NUL-padded, password 32 bytes NUL-padded. Each frame has a 16-byte header (payload size, itrack 0, flags 1, zero) followed by a JPEG (`FF D8`..`FF D9`) which may arrive in chunks of about 4096 bytes. ha-bambulab implements exactly this: port 6000 hardcoded, 12 connection attempts, used only when the model lacks `CAMERA_RTSP` (ha-bambulab `custom_components/bambu_lab/pybambu/bambu_client.py`, `ChamberImageThread`, `start_camera`).
- H2S and H2D (firmware 01.02.00.00 observed): RTSPS is off by default; port 322 closes immediately and `push_status` `ipcam.rtsp_url` reads `"disable"` until "LAN Mode Liveview" is enabled on the touchscreen. Otherwise the slicer falls back to cloud relays (TUTK or Agora) (OpenBambuAPI `video.md`).
- Credentials: user `bblp`, password the LAN access code.
- Authorization Control: X1 firmware 01.08.05.00 dated 2025/03/12 added verification of control commands (Bambu firmware page, via search result: https://bambulab.com/zh/support/firmware-download/x1). Developer Mode (LAN-only) disables it. Secondary sources claim remote video initiation is among the gated operations (https://all3dp.com/4/bambu-labs-controversial-authorization-control-hits-budget-3d-printers/); whether LAN camera still works without Developer Mode on each model is (unverified). Treat the LAN camera as at risk of firmware changes.

**Prusa** (two separate paths):
- Prusa Connect (cloud, push): the camera uploads JPEG snapshots with `PUT /c/snapshot` and `PUT /c/info`, authenticated by a 20-character Token and a camera-generated Fingerprint; both are deprecated in favour of `https://camera-service.prusa3d.com/v1/snapshot` and `/v1/camera-info` (https://connect.prusa3d.com/docs/cameras/camera_communication/). No documented pull stream from Connect. Header names and host `webcam.connect.prusa3d.com` come from forum scripts (https://forum.prusa3d.com/forum/introcuctions-instrutctions/prusaconnect-camera-with-raspberry-pi-curl) (unverified). The docs state no image format, rate limit or retrieval API.
- PrusaLink (local, pull): the PrusaLink spec defines `GET /api/v1/cameras` (list active cameras and properties), `GET /api/v1/cameras/{id}`, `GET /api/v1/cameras/snap` (image from the default camera, `image/png`, 204 if no image), `GET /api/v1/cameras/{id}/snap` (same for a given id), `POST /api/v1/cameras/{id}/snap` (take a snapshot; only during camera initialization or in a limited state per its description), `/api/v1/cameras/{id}/config` and `/connection` (Prusa-Link-Web@a67f306:spec/openapi.yaml:392-630). The spec shows snapshots only, no continuous stream endpoint (not found in the spec). Whether a given printer firmware exposes it and the authentication scheme (the spec lists 401/403 responses) were not checked against hardware (unverified).

### 2. Rendering in a VS Code webview

- **Isolation**: the webview host creates the content iframe with `sandbox="allow-same-origin allow-pointer-lock"` plus `allow-scripts allow-downloads` when scripts are enabled and `allow-forms` when forms are; the `allow` permissions list is `cross-origin-isolated; autoplay; local-network-access;` (+ clipboard when scripts on) (vscode@4ef6bab:src/vs/workbench/contrib/webview/browser/pre/index.html:1072,1082). No camera or microphone permission is granted, which is irrelevant for viewing but excludes `getUserMedia`. No `allow-popups`, so iframe-embedded camera UIs cannot open windows.
- **CSP is authored by the extension**: the host does not inject a CSP; it only checks the content's meta CSP (reports `no-csp-found` if absent) and rewrites `vscode-resource:` tokens to `cspSource` (same file). The VS Code guide recommends `default-src 'none'` and re-allowing explicitly (https://code.visualstudio.com/api/extension-guides/webview). Directives we would need, by player:
  - MJPEG / snapshot: `img-src ${cspSource} http: https: data: blob:` (an `<img src>` pointing at the camera works with no CORS; narrow `http:` to the specific origin or to the proxy).
  - MSE / `<video>`: `media-src blob: http: https:` plus `connect-src` for the fetch/WS that feeds MediaSource.
  - WebRTC: signalling needs `connect-src` for the HTTP/WS origin (`ws:`/`wss:` must be listed explicitly). Media travels over ICE on the peer connection and is not governed by CSP (general browser behaviour; no VS Code doc covers WebRTC in webviews, (unverified) until tried in a VSCodium build).
  - Scripts: `script-src 'nonce-...' ${cspSource}`; no inline scripts.
- **Local resources**: `webview.asWebviewUri` for bundled player JS; `localResourceRoots` restricts local files (vscode@4ef6bab:src/vscode-dts/vscode.d.ts:9906-9947).
- **`portMapping`**: remaps `localhost:webviewPort` to `extensionHostPort`, only for http/https; websocket URLs cannot be mapped (vscode@4ef6bab:src/vscode-dts/vscode.d.ts:9885-9947). This matters in remote/Codespaces setups where the extension host is not on the user's machine, and for any extension-host proxy: webview-to-proxy traffic needs the mapping, while WebRTC/WS to the real printer would run from the UI machine's browser instead. `env.asExternalUri` is the API for resolving a localhost URL to something reachable by the UI side (vscode@4ef6bab:src/vscode-dts/vscode.d.ts:10888-10927).
- **Codecs**: VS Code documents video H.264 and VP8, audio Wav, Mp3, Ogg, Flac, and notes AAC audio in MP4 will not play (https://code.visualstudio.com/api/extension-guides/webview). Electron builds with `proprietary_codecs = true` and `ffmpeg_branding = "Chrome"` (https://raw.githubusercontent.com/electron/electron/main/build/args/all.gn), so H.264 decodes in the default build. A VSCodium build that swaps the Electron ffmpeg library for a codec-free one would lose H.264 (Eclipse Theia's IP team does this deliberately, per https://gitlab.eclipse.org/eclipsefdn/emo-team/iplab/-/issues/7912). The custom VSCodium build must keep the standard Electron ffmpeg. AV1 and HEVC are not configured in `all.gn`; AV1 software decode in Chromium and HEVC (WebRTC H.265 from Chrome 136 per go2rtc README) depend on the Chromium version inside the shipped Electron, so verify per release (unverified). Plan on H.264 or JPEG only.
- **Proxying through the extension host**: browser-side limits (mixed content cannot arise inside the `vscode-webview` origin for http images, but CORS blocks `fetch` to printers without CORS headers, and credentials in URLs are stripped from `<img>`) make an extension-host proxy the robust route. Options: (a) a local HTTP server on 127.0.0.1 bound to a random port, started by the extension host, serving `/camera/<id>/snapshot` and `/stream` (multipart passthrough) and adding auth headers, reached through `portMapping`; (b) postMessage of JPEG frames as `Uint8Array`/Blob to a `<canvas>`, simplest and works remote, but copies each frame across the IPC boundary. Neither is documented by VS Code as the recommended route (unverified; design judgement).
- **Authentication**: MJPEG/snapshot with Basic auth or tokens in the query is handled in the proxy; Moonraker normally relies on trusted-clients IP, API key or short-lived `oneshot_token` (not researched here; (unverified)). Bambu RTSPS and port 6000 require TLS with the printer's self-signed certificate and `bblp` + access code, so a browser cannot connect at all; the extension host (Node `tls`) must do it. go2rtc needs `api.local_auth` or a reverse proxy.

### 3. Snapshot and timelapse

| Ecosystem | Snapshot | Timelapse production | Format | Retrieval |
|---|---|---|---|---|
| Moonraker + Klipper | `snapshot_url` from webcam config (Moonraker doc); crowsnest `/?action=snapshot` | moonraker-timelapse: `mode = layermacro` (slicer/macro calls `TIMELAPSE_TAKE_FRAME`) or `hyperlapse` (`hyperlapse_cycle`); frames in `frame_path` (default `/tmp/timelapse/`), ffmpeg render (docs `configuration.md`) | H.264 MP4 (`component/timelapse.py:694` command writes `<name>.mp4`), `constant_rate_factor` 23, pixel format `yuv420p`; optional preview image and frames zip | Moonraker file API root `timelapse` (`timelapse.py:141` `register_directory("timelapse", ...)`, default `~/timelapse/`); endpoints `/machine/timelapse/render|saveframes|settings|lastframeinfo` (`:159-167`); websocket event `timelapse:timelapse_event` (`:837`). GPL-3.0. |
| OctoPrint | `webcam.snapshot` URL | Built-in timelapse: `zchange` or `timed`; ffmpeg render, default codec `mpeg2video`, bitrate setting (config.yaml docs) | MPEG-family video file (extension not documented in sources read) (unverified) | REST `GET /api/timelapse` (list, `unrendered=true`), `DELETE`, `POST /api/timelapse/unrendered/{name}` `{"command":"render"}` (https://docs.octoprint.org/en/master/api/timelapse.html); each entry has a `url`. |
| Octolapse (OctoPrint plugin, AGPL-3.0) | Moves head before each snapshot, triggers per layer, height, time, or G-code `@OCTOLAPSE TAKE-SNAPSHOT` | Own render pipeline (H.265 beta noted) | Video; images archivable | Plugin UI browser only; no documented API (README, https://github.com/FormerLurker/Octolapse). |
| Bambu | Frame from port 6000 / RTSPS | On-printer timelapse stored on the SD card (user-reported folder `timelapse`; `cache`, `ipcam` also present; A1 mini user saw `cam`) (https://forum.bambulab.com/t/a1-mini-timelapse-location/38563) | MP4 per users; AVI files without index reported (https://forum.bambulab.com/t/sd-card-reading-from-pc/52861) (unverified, forum) | Implicit FTPS on 990 as `bblp`/access code (OpenBambuAPI `ftp.md`; ha-bambulab uses `ftp.connect(port=990)` then `prot_p()`). Directory layout is not in OpenBambuAPI `ftp.md` (unverified). |
| Prusa Connect / PrusaLink | Connect: pushed JPEG; PrusaLink: `GET /api/v1/cameras/{id}/snap` (PNG) | Connect builds timelapses in the cloud (not covered by the camera docs read; (unverified)) | n/a | Connect: cloud only. PrusaLink: snapshot pull only (no timelapse endpoint found in the camera section of the spec). |

### 4. Latency and bandwidth

No measurements were taken. Qualitative ordering comes from the go2rtc README table (WebRTC lowest latency, MSE medium, HLS and HTTP progressive worst). Numeric ranges below are generic engineering estimates, (unverified), to be replaced by bench data.

| Stream | Latency (est.) | Bandwidth | Fit |
|---|---|---|---|
| WebRTC H.264 | ~0.2-0.5 s | 1-4 Mbit/s at 720p-1080p | Best live view; needs UDP path and signalling. |
| MSE fMP4 (go2rtc) | ~0.5-2 s | same as source | Good fallback, works through an HTTP proxy. |
| HLS | 3-10+ s typical | same as source | Avoid for live; ok for read-only dashboards. |
| MJPEG multipart | ~0.1-0.5 s, no inter-frame buffering | Highest per quality: every frame full JPEG, roughly 0.5-3 Mbit/s at 720p 10-15 fps | Simplest, works in `<img>`, robust. camera-streamer/ustreamer cap with fps settings (`target_fps`, `target_fps_idle` 15/5 defaults in Moonraker). |
| Bambu A1/P1 port 6000 | one JPEG per frame, low frame rate (rate not documented; (unverified)) | 1280x720 JPEG | Only option on that hardware. |
| Bambu X1 RTSPS | H.264 via RTSP; depends on printer | printer-limited | Needs RTSP gateway. |
| Prusa Connect / PrusaLink | Connect: interval upload (forum scripts use 30 s); PrusaLink: one PNG per request | one image per request or interval | Snapshot only. |

## Comparison

| Capability | Moonraker/Klipper | OctoPrint | Bambu LAN | Prusa Connect / PrusaLink |
|---|---|---|---|---|
| Discover camera URLs via API | Yes, `/server/webcams/list` | Partial (`webcam.stream` in settings API) (unverified) | MQTT `ipcam` block, fixed ports | No |
| Live stream a webview can show directly | MJPEG, WebRTC | MJPEG | No (TLS + auth) | No |
| Needs gateway/extension-host code | Only for auth/remote | Only for auth/remote | Always | Not applicable |
| Snapshot | Yes | Yes | Yes (frame grab) | Yes (pushed) |
| Timelapse on device, retrievable | Yes (plugin, mp4 via file API) | Yes (REST) | Yes (SD card via FTPS) | Cloud |
| Licence of reference components | GPL-3.0 (crowsnest, timelapse, camera-streamer), MIT (go2rtc) | AGPL (Octolapse) | Protocol docs only | n/a |

## Implications for VSSlicer

Reimplement protocol clients in the extension host; reuse nothing GPL as code (read-only references).

1. **Camera adapter interface** (TypeScript, extension host):
   - `CameraSource { id; label; kind: 'mjpeg'|'jpeg-poll'|'webrtc'|'mse'|'rtsp'|'bambu-jpeg'; capabilities: {live, snapshot, timelapseList} }`
   - `snapshot(): Promise<Uint8Array>` always implemented, the lowest common denominator.
   - `openLive(opts): Promise<LiveStream>` returning one of `{type:'mjpeg-url', url}` (proxied local URL), `{type:'frames', onFrame(cb)}` (JPEG push), `{type:'whep'|'go2rtc-ws', url}`, `{type:'mse', url}`; plus `close()`.
   - `timelapses?(): list/download` with per-ecosystem providers (Moonraker file API root `timelapse`, OctoPrint `/api/timelapse`, Bambu FTPS).
   - Discovery providers: Moonraker `/server/webcams/list` fills the source list automatically; Bambu from the MQTT `ipcam` state; manual URL for everything else.
2. **Webview player**: a single small module with three renderers chosen by `LiveStream.type`: `<img>` for MJPEG URLs, `<canvas>` for pushed JPEG frames (Bambu A1/P1), `<video>` for WebRTC/MSE. Copy the signalling flow from go2rtc/WHEP rather than depending on Mainsail/Fluidd components. Unified CSP built from the source origin list; no `unsafe-inline`.
3. **Path of least risk for v1**: snapshot polling plus MJPEG through a loopback proxy in the extension host (portMapping or frame postMessage), which covers Klipper, OctoPrint, and (with the port 6000 client) Bambu A1/P1. Treat WebRTC as an optional second step for Moonraker cameras served by go2rtc/camera-streamer, where the webview can connect directly when UDP reaches the printer.
4. **Bambu X1/H2**: either implement RTSP-to-MJPEG/fMP4 in the extension host (needs ffmpeg or a Node RTSP/H.264 decoder, both non-trivial) or document go2rtc as an optional sidecar (MIT, ships a zero-dependency binary). Recommend the sidecar path as optional configuration and a clear "LAN Mode Liveview" hint for H2S/H2D.
5. **Keep H.264/JPEG only**; require the custom VSCodium build to retain Electron's stock ffmpeg.
6. **Secrets**: LAN access codes and Moonraker keys in `SecretStorage`; proxy listens on 127.0.0.1 only with a random per-session token in the URL path.
7. **Prusa**: no live stream in R1. Support PrusaLink snapshot polling (`/api/v1/cameras/{id}/snap`) as a `jpeg-poll` source, plus any user-supplied stream URL; Connect is cloud-only and out of scope.

## Licence notes

- go2rtc: MIT (GitHub API, 2026-10-25). Safe to bundle/optionally download.
- camera-streamer: GPL-3.0 (README). crowsnest, moonraker-timelapse: GPL-3.0 (GitHub API). Interact over HTTP/REST only; do not copy code.
- Octolapse: AGPL-3.0 (GitHub API); no code reuse.
- Mainsail@03a4d7b and Fluidd@b36a497: GPL-3.0 (`LICENSE` in each clone); read for behaviour only, do not copy.
- OpenBambuAPI@cc383a2: GNU Free Documentation License 1.3 (`LICENSE.md`); use the protocol description only, write our own client.
- ha-bambulab@0e027ff: MIT (`LICENSE`); still write our own client from the protocol.
- Anything implementing Bambu cloud relays (TUTK/Agora) is out of scope.

## Open questions

- Does WebRTC with ICE to a LAN address work from a VS Code/VSCodium webview in every host (desktop, remote-SSH, Codespaces, web)? Needs a prototype; no VS Code documentation covers it.
- Does the `local-network-access` permission in the webview `allow` list affect cross-origin requests to LAN hosts in recent Chromium (Local Network Access prompts)? Verify with the target Electron version.
- Bambu: LAN camera behaviour after Authorization Control per model and firmware (X1 01.08.05.00 and later; H2 series), and whether Developer Mode is required; Bambu's A1/P1 port 6000 frame rate and whether newer firmware moved A1/P1 to RTSPS.
- Bambu SD-card timelapse path, file container and index issues per model.
- Moonraker authentication options for webcam URLs (oneshot tokens vs trusted clients) and CORS defaults.
- Real latency and bandwidth numbers; a short bench per stream type is needed.
- Prusa camera service API payload (headers, format, interval) beyond forum scripts; which PrusaLink firmware versions expose `/api/v1/cameras*` and how it authenticates; whether any PrusaLink endpoint streams.
- AV1 and HEVC decode availability in the Electron version VSCodium will ship.
