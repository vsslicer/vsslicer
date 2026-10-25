---
id: US67
title: "A maintainer knows each shipped build starts, has the VSSlicer extensions active and slices the cube"
status: reviewed
epic: VSS:E69
---

As a maintainer, I want one smoke test per shipped target that installs the build, starts it with the built-in VSSlicer extensions active, opens fixtures and slices the cube with a downloaded engine, so that no release ships a build that does not run.

## Acceptance criteria

- [ ] The built-in list carries the final release of every bundled extension module (G-code, project, profiles, printers, Bambu, camera, filament, slicer) and `vsslicer.themes`, each with a verified `sha256`
- [ ] Smoke test per shipped target: install, start, the built-in VSSlicer extensions are active, open the G-code and 3MF fixtures, slice the cube fixture with a downloaded Orca CLI, quit cleanly
- [ ] Linux builds are released as GitHub releases with the smoke tests green (unsigned, allowed by D10)
- [ ] `THIRD-PARTY-NOTICES` and the source offer are present in every installer

## Out of scope

- Hardware printing from the build (verified per module on the H2C).
