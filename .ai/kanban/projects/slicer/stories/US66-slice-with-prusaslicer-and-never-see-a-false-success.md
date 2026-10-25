---
id: US66
title: "Slice with PrusaSlicer and never see a false success"
status: reviewed
epic: VSS:E65
---

As a Prusa printer owner, I want a slice to succeed only when the output is real, so that a failed slice is never reported as done.

## Acceptance criteria

- [ ] The adapter runs the 2.9.x CLI with a private `--datadir` so the preset update prompt cannot block, and emits the INI from `ProfileStore.resolve(...).native("prusa")`
- [ ] Success requires an existing, non-empty, parseable output file and no error line on stderr; a missing output, an empty output and a stderr error line each end in the right typed error, one test per case with recorded stderr (regression: a failed slice reported as success)
- [ ] Progress is indeterminate and cancel leaves no staged files
- [ ] Fixtures only (D5: no Prusa hardware)

## Out of scope

