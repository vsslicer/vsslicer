---
id: I7
title: Cameras: watch printers live
status: reviewed
milestone: M4
order: 7
projects: PRN
phases: 7 (cameras)
---

## Problem

Remote monitoring is why people keep a printer web UI open next to the slicer. The daemon and the Bambu adapter exist after I4; the camera paths do not.

## Outcome

`vsslicer.camera`: snapshot polling and MJPEG through the daemon's loopback proxy (Klipper, OctoPrint, PrusaLink), pushed JPEG frames for Bambu A1/P1, WebRTC for go2rtc and camera-streamer, and an optional go2rtc sidecar for Bambu RTSPS (the H2C path), with a `CameraSource` per adapter, snapshots and timelapse retrieval.

## Roadmap phases and feature-matrix rows

Roadmap phase(s) 7 (cameras) (`.ai/plans/roadmap.md`). Rows (`docs/research/feature-matrix.md`): §12 Live camera view, Snapshot and timelapse retrieval (Timelapse G-code generation is a pass-through in SLC).

## Exit criteria

- Camera adapters pass against a local MJPEG/JPEG test server and recorded streams; CSP tests pass
- The H2C camera shows live in VS Code with the chosen transport, latency and bandwidth recorded per stream type
- Snapshot and timelapse files download from Moonraker and Bambu

## Order: 7 of 11

Seventh: usability, after I4 supplies the registry, daemon and the Bambu session. Independent of I5 and I6, so it can run in parallel with them.

Order rationale follows the roadmap's rule: testability first (libraries checked against deterministic fixtures and external oracles), usability next (daily workflows on proven foundations), functionality last (breadth, optional engines, the fork).
