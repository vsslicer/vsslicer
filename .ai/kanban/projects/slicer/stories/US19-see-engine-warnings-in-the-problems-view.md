---
id: US19
title: "See engine warnings in the Problems view"
status: reviewed
epic: VSS:E29
---

As a user, I want warnings from Orca and CuraEngine to appear in Problems, attached to something I can open, so that I do not have to read terminal output.

## Acceptance criteria

- [ ] `$vsslicer-orca` and `$vsslicer-cura` are contributed in `package.json`; tests on recorded engine output give one Problems entry per warning (regression: a changed warning format silently drops warnings)
- [ ] Warnings without a file location are attached to the plate's 3MF or the profile file
- [ ] Recorded outputs exist for each adapter, with the engine versions recorded

## Out of scope

- PrusaSlicer matcher (added with E65)
