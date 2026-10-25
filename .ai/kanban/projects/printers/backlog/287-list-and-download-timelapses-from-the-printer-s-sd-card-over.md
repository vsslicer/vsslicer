---
id: 287
title: "List and download timelapses from the printer's SD card over FTPS"
type: feature
priority: P2
effort: M
model: sonnet
area: [camera, bambu, storage]
story: US47
milestone: "VSS:M4"
sprint: "VSS:SP32"
depends_on: [267, 280, 148, 286, 334]
created: 2026-10-25
---

The Bambu `TimelapseProvider`, using the FTPS file operations of `printer-bambu` through the printer-api session.

**Code:** `vsslicer/modules/camera-bambu/src/adapters/...` (module: `camera-bambu`, layer: `adapters`)

## Acceptance criteria

- [ ] Against the printer-api fake adapter with a recorded folder listing: list, download with progress and cancel; the camera-api timelapse contract passes
- [ ] An unplayable or index-less file downloads with a note, not an error
- [ ] Verified on fixtures here; the H2C run is in the Timelapses verification card

## Tasks

- [ ] Write list and download over the session files
- [ ] Write the playability note
- [ ] Run the contract

## Progress

Not started.
