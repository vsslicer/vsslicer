---
id: 50
title: "Model and write `slice_info.config`, the plate settings files and the MD5 entries"
type: feature
priority: P1
effort: M
model: opus
area: [engine]
story: US10
milestone: "VSS:M3"
sprint: "VSS:SP19"
depends_on: [49, GCP-8]
created: 2026-10-25
---

Builds the text of `slice_info.config`, `model_settings.config` and `project_settings.config` from the plate, its statistics (from `readSummary`) and the resolved settings, and the `plate_N.gcode.md5` entry.

**Code:** `vsslicer/modules/slicer/output/src/domain/...` (module: `slicer-output`, layer: `domain`)

## Acceptance criteria

- [ ] The generated `slice_info.config` has the keys found by the spike and matches the Bambu Studio export for the fixture plate field by field
- [ ] MD5 is computed over the exact bytes of the (post-processed) G-code
- [ ] Values come from the slice statistics, not defaults; a missing statistic yields an absent field and a warning

## Tasks

- [ ] Model the config files
- [ ] Statistics mapping
- [ ] MD5
- [ ] Compare with the export

## Progress

Not started.
