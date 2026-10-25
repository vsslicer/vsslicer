---
id: US33
title: "Each adapter publishes the printer's current file and position as a live feed"
status: reviewed
epic: VSS:E25
---

As the author of the preview, I want a `follow` feed of `{fileName, fileUri?, byteOffset, layer?, progress, state}` per printer, so that a running print can be followed.

## Acceptance criteria

- [ ] Live feed contract tests per adapter from recorded status fixtures: offsets monotonic during a print, reset on a new job, null when unknown (Moonraker `virtual_sdcard.file_position`, OctoPrint `progress.filepos`, PrusaLink and Duet progress with offset where exposed, Bambu line number or percent)
- [ ] The H2C spike decides whether Bambu follow is by line number or percent only, and the decision is recorded
- [ ] The feed maps the printer's file to a local URI when the file was sent from this machine (upload record)

## Out of scope

- The follow rendering (GCP E7).
