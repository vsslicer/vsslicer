---
id: 11
title: Remote camera streams
type: spike
priority: P1
effort: M
area: [camera]
milestone: R1
sprint: SP0
owner: worker-sonnet
created: 2026-10-25
---

How printer cameras stream and how to show them in a webview.

Report: `docs/research/remote-camera.md`. Notes: `.reference/notes/VSS-11-remote-camera.md`.

## Acceptance criteria

- [x] Stream types documented: MJPEG (OctoPrint/Mainsail webcam, camera-streamer), WebRTC (go2rtc, camera-streamer, crowsnest), RTSP, HLS; Bambu camera (LAN TLS stream on port 6000 for P1/A1, RTSP on X1), Prusa camera (Prusa Connect upload model); firmware versions and dates
- [x] Rendering in a VS Code webview: CSP constraints for `img`/`video`/WebRTC, codecs available in Electron (H.264, AV1), proxying through the extension host, authentication
- [x] Snapshot and timelapse: how each ecosystem produces them (Moonraker timelapse, OctoPrint Octolapse, Bambu on-printer timelapse), file formats and retrieval
- [x] Latency and bandwidth characteristics per stream type
- [x] Recommendation for a camera adapter interface and the webview player

## Tasks

- [x] Read go2rtc, camera-streamer, crowsnest, Moonraker webcam API docs
- [x] Read VS Code webview CSP docs, Electron codec notes
- [x] Write the report

## Progress

Done. MJPEG, WebRTC (go2rtc, camera-streamer, crowsnest), RTSP, HLS, Bambu and Prusa cameras (including PrusaLink `/api/v1/cameras/{id}/snap`), webview rendering constraints (CSP, codecs, proxying, auth), snapshots and timelapses per ecosystem, adapter and player recommendation; licences of all cloned sources stated. Reviewed by a reviewer worker (`.ai/local/reviews/VSS-{n}.md`); fixes requested were applied and re-verified (`.ai/local/reviews/fix-verification.md`). Open: latency/bandwidth figures are estimates; WebRTC and local-network-access inside a webview and AV1/HEVC availability in Electron untested.
