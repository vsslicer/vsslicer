---
id: 11
title: Remote camera streams
type: spike
priority: P1
effort: M
area: [camera]
milestone: R1
created: 2026-10-25
---

How printer cameras stream and how to show them in a webview.

Report: `docs/research/remote-camera.md`. Notes: `.reference/notes/VSS-11-remote-camera.md`.

## Acceptance criteria

- [ ] Stream types documented: MJPEG (OctoPrint/Mainsail webcam, camera-streamer), WebRTC (go2rtc, camera-streamer, crowsnest), RTSP, HLS; Bambu camera (LAN TLS stream on port 6000 for P1/A1, RTSP on X1), Prusa camera (Prusa Connect upload model); firmware versions and dates
- [ ] Rendering in a VS Code webview: CSP constraints for `img`/`video`/WebRTC, codecs available in Electron (H.264, AV1), proxying through the extension host, authentication
- [ ] Snapshot and timelapse: how each ecosystem produces them (Moonraker timelapse, OctoPrint Octolapse, Bambu on-printer timelapse), file formats and retrieval
- [ ] Latency and bandwidth characteristics per stream type
- [ ] Recommendation for a camera adapter interface and the webview player

## Tasks

- [ ] Read go2rtc, camera-streamer, crowsnest, Moonraker webcam API docs
- [ ] Read VS Code webview CSP docs, Electron codec notes
- [ ] Write the report

## Progress

Not started.
