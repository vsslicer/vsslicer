---
id: 255
title: "Map Moonraker, OctoPrint and PrusaLink camera lists and manual URLs to descriptors"
type: feature
priority: P1
effort: M
model: sonnet
area: [camera, moonraker, octoprint, prusalink]
story: US42
milestone: "VSS:M4"
sprint: "VSS:SP28"
depends_on: [254, 246, PLT-13]
created: 2026-10-25
---

Pure mappers from the camera endpoints' responses to `mjpeg` or `jpeg-poll` descriptors: Moonraker `/server/webcams/list` (services other than MJPEG and snapshot are skipped for camera-webrtc), OctoPrint settings webcam URLs, PrusaLink `/api/v1/cameras`, and a manual URL.

**Code:** `vsslicer/modules/camera/mjpeg/src/domain/...` (module: `camera-mjpeg`, layer: `domain`)

## Acceptance criteria

- [ ] Recorded response fixtures under `test/fixtures/` (with PROVENANCE.md) map to the expected descriptors: relative URLs resolved against the printer, snapshot URL paired with stream URL
- [ ] A `webrtc-*` service entry is skipped, and an entry with no usable URL is reported, not thrown
- [ ] A manual URL is validated (http/https only, no credentials in the URL)

## Tasks

- [ ] Add recorded responses
- [ ] Write the three mappers and the manual URL check
- [ ] Write tests

## Progress

Not started.
