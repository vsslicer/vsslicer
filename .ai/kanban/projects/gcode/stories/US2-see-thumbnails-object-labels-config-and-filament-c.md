---
id: US2
title: "See thumbnails, object labels, config and filament cost of a job"
status: reviewed
epic: VSS:E3
---

As a user opening a sliced file, I want thumbnails, object labels, the slicer config block and per-extruder filament length, volume, weight, cost and the slicer's own time estimate, so I know what the file is before looking at toolpaths; other projects read the same through `readSummary(uri)` without parsing moves.

## Acceptance criteria

- [ ] Thumbnails (PNG, JPG, QOI, Prusa comment form) are extracted; unsupported formats leave a marker
- [ ] Object labels are read in all three forms plus Cura `;MESH:`
- [ ] The config block is exposed as a key-value map
- [ ] Summary statistics match the slicer's own comments (or `slice_info.config`) per extruder on every fixture
- [ ] `readSummary(uri)` returns statistics without parsing moves

## Out of scope

- Rendering of thumbnails (E5)
