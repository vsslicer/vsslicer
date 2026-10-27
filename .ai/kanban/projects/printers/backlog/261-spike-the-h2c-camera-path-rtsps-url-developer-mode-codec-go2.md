---
id: 261
title: "Spike: the H2C camera path (RTSPS URL, Developer Mode, codec, go2rtc)"
type: spike
priority: P1
effort: M
model: opus
area: [camera, bambu]
story: US44
milestone: "VSS:M4"
sprint: "VSS:SP28"
depends_on: [30]
created: 2026-10-25
---

One day on the H2C, the only hardware (D5), to settle what E38 left open before sidecar code: the RTSPS URL from `ipcam.rtsp_url`, whether Developer Mode is needed, the codec, and whether go2rtc connects (one user report of refused connections on port 322).

**Code:** `vsslicer/modules/camera/bambu/` (module: `camera-bambu`, layer: `n/a (docs)`)

## Acceptance criteria

- [ ] Written up in `docs/` with the H2C firmware version and date: URL form, auth, codec and resolution, the `disable` behaviour with LAN Mode Liveview off
- [ ] go2rtc (pinned release) connects to the H2C stream and re-serves it as MJPEG and MSE, or the failure is recorded with the packet-level reason
- [ ] A short recorded RTSP clip within the fixtures size cap with PROVENANCE.md, for the CI test stream
- [ ] The go2rtc version and per-platform asset names to pin are recorded for the download card

## Tasks

- [ ] Read the connectivity notes on cameras
- [ ] Run go2rtc against the H2C
- [ ] Write the findings and save the clip

## Progress

Not started.
