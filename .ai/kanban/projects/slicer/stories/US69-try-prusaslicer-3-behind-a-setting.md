---
id: US69
title: "Try PrusaSlicer 3.0 behind a setting"
status: reviewed
epic: VSS:E65
---

As an early adopter, I want to switch to the PrusaSlicer 3.0 CLI, so that I can use it when it is stable.

## Acceptance criteria

- [ ] A setting selects the 3.0 CLI, which loads JSON with `--load` and preset names with `--datadir`
- [ ] The exit-code bug (3.0 returns 0 on failure) is covered by the same output validation as 2.9.x
- [ ] A capability table generated from `--export-config-schema` matches the hand-maintained 2.9.x table for shared keys
- [ ] A spike records 3.0 CLI stability and whether a published non-GUI build exists, which decides when 3.0 becomes the default

## Out of scope

- Making 3.0 the default
