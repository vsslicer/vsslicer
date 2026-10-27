---
id: 52
title: "Implement `writeSlicedOutput(plate, gcode, format)` with the thumbnail renderer port"
type: feature
priority: P1
effort: M
model: opus
area: [engine]
story: US10
milestone: "VSS:M3"
sprint: "VSS:SP17"
depends_on: [48, 51]
created: 2026-10-25
---

The use case the pipeline calls: decide plain G-code or `.gcode.3mf`, ask the `ThumbnailRenderer` port (backed by `vsslicer.project` `renderThumbnail(plate)`, faked in tests) for images, insert or embed them, and degrade when the renderer is missing.

**Code:** `vsslicer/modules/slicer/output/src/application/...` (module: `slicer-output`, layer: `application`)

## Acceptance criteria

- [ ] A missing or failing renderer gives a warning and an archive or G-code without thumbnails, never a thrown error (test with a failing fake)
- [ ] Plain G-code output has blocks only for formats named by the profile; `.gcode.3mf` has `plate_N.png` and `plate_no_light_N.png`
- [ ] The result lists written files and warnings

## Tasks

- [ ] Port and use case
- [ ] Degrade path
- [ ] Tests with fakes

## Progress

Not started.
