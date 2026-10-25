---
id: US20
title: "Preview a sliced plate in the G-code preview"
status: reviewed
epic: VSS:E10
---

As a user with a sliced project, I want a "Preview sliced plate" action, so that the embedded G-code opens in the I1 preview.

## Acceptance criteria

- [ ] The command calls `GcodePreview.open(uri, {plate})` and, on a `.gcode.3mf` fixture, opens the matching `plate_N.gcode` in `vsslicer.gcode`
- [ ] If `vsslicer.gcode` is not installed the command explains how to get it
- [ ] A test catches API drift with GCP
- [ ] Verified only on fixtures (D5)

## Out of scope

- Writing G-code into projects (E27)
