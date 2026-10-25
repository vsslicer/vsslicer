---
id: US30
title: "A user opens G-code from the printer in the preview and sees thumbnails"
status: reviewed
epic: VSS:E24
---

As a user, I want opening a G-code file under `printer://` to open the `vsslicer.gcode` preview and thumbnails to show in the file list, so that I can inspect what is on the printer.

## Acceptance criteria

- [ ] Opening a `printer://` G-code file opens the preview (integration test with the GCP custom editor); without the preview extension the file opens as text
- [ ] Thumbnails from `fileMetadata` appear in a hover or a custom view

## Out of scope

- Editing files in place on the printer.
