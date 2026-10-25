---
id: 303
title: Verify the H2C live view and record latency and bandwidth
type: chore
priority: P1
effort: M
model: opus
area: [camera, bambu]
story: US44
milestone: "VSS:M4"
sprint: "VSS:SP33"
depends_on: [301, 302, 271, 267]
created: 2026-10-25
---

The E38 oracle on the owner's H2C (D5): live view in VS Code through go2rtc, with glass-to-glass latency and bandwidth measured.

**Code:** `vsslicer/modules/camera-extension/` (module: `camera-extension`, layer: `n/a (hardware verification)`)

## Acceptance criteria

- [ ] With LAN Mode Liveview on, the H2C camera plays live in VS Code; firmware version, transport (MJPEG or MSE), resolution, glass-to-glass latency and bandwidth recorded in `docs/` with date
- [ ] With Liveview off, the hint is shown
- [ ] The sidecar exits when the window and agent close; a wrong go2rtc checksum run refuses to start (manual confirmation)

## Tasks

- [ ] Prepare the measurement method
- [ ] Run on the H2C with Liveview on and off
- [ ] Write the results

## Progress

Not started.
