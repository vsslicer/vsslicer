---
id: 285
title: "Spike: find the H2C timelapse folder and container over FTPS"
type: spike
priority: P2
effort: S
model: opus
area: [camera, bambu]
story: US47
milestone: "VSS:M4"
sprint: "VSS:SP34"
depends_on: [30]
created: 2026-10-25
---

On the H2C, find where timelapses land on the SD card, their container (MP4 or AVI), whether they are index-less, and note other models' reports.

**Code:** `vsslicer/modules/camera-bambu/` (module: `camera-bambu`, layer: `n/a (docs)`)

## Acceptance criteria

- [ ] Written up in `docs/` with firmware and date: folder path, file naming, container, size and whether VS Code's media preview plays one file
- [ ] Per-model entries for the models other reports describe, marked 'unverified' (D5)

## Tasks

- [ ] Connect over FTPS
- [ ] Record one timelapse's path and container
- [ ] Write the findings

## Progress

Not started.
