---
id: 311
title: Verify the Timelapses view on the H2C
type: chore
priority: P2
effort: S
model: opus
area: [camera, bambu]
story: US48
milestone: "VSS:M4"
sprint: "VSS:SP24"
depends_on: [310, 288]
created: 2026-10-25
---

The E39 oracle on the H2C: list and download one timelapse from the SD card in the view, and play it.

**Code:** `vsslicer/modules/camera-extension/` (module: `camera-extension`, layer: `n/a (hardware verification)`)

## Acceptance criteria

- [ ] Firmware and date recorded in `docs/`: folder found over FTPS, one file listed and downloaded, container (MP4 or AVI) and whether it plays in VS Code
- [ ] Moonraker and OctoPrint timelapses verified on recordings only (D5)

## Tasks

- [ ] Run on the H2C
- [ ] Write the results

## Progress

Not started.
