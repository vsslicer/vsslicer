---
id: US10
title: "Get a Bambu .gcode.3mf the H2C accepts"
status: reviewed
epic: VSS:E27
---

As a Bambu user, I want the sliced result as a `.gcode.3mf` with plate G-code, MD5, `slice_info.config` and thumbnails, so that the H2C accepts and prints it.

## Acceptance criteria

- [ ] The assembled archive has `Metadata/plate_N.gcode` and `.md5`, `plate_N.png`, `plate_no_light_N.png`, `slice_info.config`, `model_settings.config` and `project_settings.config`, no mesh
- [ ] Structurally equal (same part list, same `slice_info` keys) to Orca's own `--export-3mf` output for the fixture plates; MD5 entries match the G-code
- [ ] The archive passes `3mf` validation and opens in `@vsslicer/gcode` (E3) with the MD5 check green
- [ ] A missing thumbnail renderer produces a warning and an archive without thumbnails, never a failed slice
- [ ] On the H2C (firmware version and date recorded) one fixture plate as `.gcode.3mf` is accepted and starts printing; everything else on fixtures (D5)
- [ ] The required `slice_info.config` fields for the H2C are recorded from a Bambu Studio export of the same plate

## Out of scope

- Binary G-code (E65)
- Sending logic (PRN)
