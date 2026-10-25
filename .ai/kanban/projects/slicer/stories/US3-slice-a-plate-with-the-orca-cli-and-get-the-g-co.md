---
id: US3
title: "Slice a plate with the Orca CLI and get the G-code"
status: reviewed
epic: VSS:E26
---

As a user, I want to slice one plate of my project with Orca and receive the G-code with progress while it runs, so that I see something is happening and find the result in `.vsslicer/sliced/`.

## Acceptance criteria

- [ ] The adapter runs the CLI with an argv array and no shell, `--slice N`, `--load-settings`, `--load-filaments` and `--outputdir` in a temp directory
- [ ] Output is moved into `.vsslicer/sliced/` only on success; an empty output directory or a missing `plate_N.gcode` raises a typed error, not success
- [ ] On Linux, `--pipe` JSON progress reaches 100 and `result.json` is read; elsewhere progress is indeterminate unless the spike shows the debug text is stable across two pinned releases
- [ ] The adapter takes already-written preset files, so it is testable with hand-written fixture presets before emission exists

## Out of scope

- Writing the presets (US8)
- Post-processing and `.gcode.3mf` assembly (US10, US20)
