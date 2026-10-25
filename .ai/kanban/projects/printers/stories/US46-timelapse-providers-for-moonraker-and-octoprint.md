---
id: US46
title: "Timelapse providers for Moonraker and OctoPrint"
status: reviewed
epic: VSS:E39
---

As an extension author and a user of an open printer, I want timelapse providers behind `CameraSource.timelapses()` that list, render and download timelapses, so that the videos are reachable from VS Code and from history records.

## Acceptance criteria

- [ ] `camera-api` defines `TimelapseEntry` and `TimelapseProvider`; a contract checks list, download with progress and cancel, and render where declared
- [ ] Moonraker (file root `timelapse`, `/machine/timelapse/*`) and OctoPrint (`GET /api/timelapse`, render of unrendered sets) providers pass against recorded responses
- [ ] Agent methods list, download and cancel timelapses without credentials leaving the agent
- [ ] Recordings only for Moonraker and OctoPrint (D5)

## Out of scope

- Octolapse (no API)
- Cloud timelapses (Prusa Connect, Bambu cloud)
- Timelapse G-code generation (SLC)
