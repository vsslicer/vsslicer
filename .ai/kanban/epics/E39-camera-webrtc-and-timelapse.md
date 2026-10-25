---
id: E39
title: Add WebRTC cameras, snapshots and timelapse retrieval
status: reviewed
initiative: I7
project: PRN
order: 8
depends_on: [E38, E24]
rows: ["§12 Snapshot and timelapse retrieval"]
---

Extends `vsslicer.camera` with low-latency WebRTC for Klipper cameras served by go2rtc or
camera-streamer, and with snapshot and timelapse retrieval: list, preview and download the timelapse
videos printers make (Moonraker timelapse, OctoPrint, Bambu SD card). It also records the latency and
bandwidth bench per stream type the research left open (`remote-camera.md` §4).

## Scope

In:
- WebRTC sources: go2rtc WS signalling (`webrtc/offer|answer|candidate`) and WHEP (MediaMTX,
  camera-streamer `/webrtc`); selected from the Moonraker webcam `service` field
  (`webrtc-go2rtc`, `webrtc-camerastreamer`, `webrtc-mediamtx`); fallback to MJPEG when ICE fails.
  The same path serves the H2C when the E38 go2rtc sidecar runs.
- Timelapse providers behind `CameraSource.timelapses()`: Moonraker file root `timelapse` and
  `/machine/timelapse/*`, OctoPrint `GET /api/timelapse` and render of unrendered sets, Bambu SD card
  over FTPS (folder found on the H2C).
- A Timelapses view per printer: list, thumbnail or first frame, download to the workspace or a
  folder through E24's download path, open in VS Code's media preview.
- Snapshot history: "save snapshot" with a timestamped name; optional snapshot at job end.
- Bench script and recorded results per stream type (MJPEG, frames, MSE, WebRTC) with date.

Out: generating timelapse G-code (SLC's §12 row), recording live streams, cloud timelapses (Prusa
Connect, Bambu cloud), Octolapse (no API).

## Feature-matrix rows

- §12 Snapshot and timelapse retrieval (P2, scheduled in I7): done when timelapses list and download
  from Moonraker and OctoPrint fixtures and from the H2C's SD card, and snapshots save to a file.

## Acceptance criteria

- [ ] WebRTC contract test against a go2rtc test instance in CI (test source), plus a WHEP test
      server; ICE failure falls back to MJPEG with a visible note
- [ ] CSP test for WebRTC: `connect-src` lists only the signalling origin
- [ ] Timelapse provider tests against recorded Moonraker and OctoPrint responses: list, render
      request, download with progress and cancel
- [ ] On the H2C (firmware recorded): find the timelapse folder over FTPS, list and download one
      file, record its container (MP4 or AVI) and whether it plays in VS Code
- [ ] Bench results committed to `docs/` with hardware, network and date; numbers replace the
      unverified estimates in `remote-camera.md` §4
- [ ] WebRTC in a webview verified on desktop VS Code on one platform and recorded as unverified on
      remote hosts if it fails there
- Moonraker and OctoPrint on recordings only (D5).

## Dependencies

- Needs E38 (player, proxy, sidecar), E24 (download path, `printer://`), E21 (FTPS), E23
  (Moonraker, OctoPrint sessions).
- Exposes `CameraSource.timelapses()` to E46 (attach a timelapse to a history record).

## Risks and spikes

- WebRTC with ICE to a LAN address from a webview is undocumented (`remote-camera.md` Open
  questions): spike (1 day) in a webview with go2rtc; if it fails, MSE through the proxy is the path.
- Bambu timelapse location and container vary by model (forum reports of index-less AVI): recorded
  per model in the capability table; unplayable files download with a note.

## Eng review

- Scope challenge: two P1-adjacent extras on the E38 player; two to three sprints. Could merge
  into E38 but that epic would exceed six sprints.
- Tests: the fallback test catches a blank player when UDP is blocked.
- Reversibility: WebRTC is chosen per camera and can be switched to MJPEG in settings.
