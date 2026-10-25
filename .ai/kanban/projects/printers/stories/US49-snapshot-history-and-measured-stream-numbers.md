---
id: US49
title: "Snapshot history and measured stream numbers"
status: reviewed
epic: VSS:E39
---

As a user, I want timestamped snapshots, optionally one at job end, and measured latency and bandwidth per stream type, so that I can keep a visual record and know which stream type to choose.

## Acceptance criteria

- [ ] Save snapshot writes a timestamped file; an optional setting saves one when a job ends
- [ ] A bench script measures MJPEG, frames, MSE and WebRTC latency and bandwidth
- [ ] Results are committed to `docs/` with hardware, network and date, replacing the unverified estimates in `remote-camera.md` §4
- [ ] camera-extension 0.2.0 ships WebRTC, timelapses and snapshot history

## Out of scope

- Recording live streams
