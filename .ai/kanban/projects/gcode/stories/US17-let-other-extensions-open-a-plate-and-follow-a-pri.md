---
id: US17
title: "Let other extensions open a plate and follow a print through a stable API"
status: reviewed
epic: VSS:E7
---

As the author of the viewer, slicer or printers extensions, I want `open`, `follow` and `stopFollow` as `exports` and as commands with serialisable arguments, with versioned types, so I can show sliced output and push progress even across extension hosts.

## Acceptance criteria

- [ ] A stub extension calls `exports` and, separately, the commands; both open the plate and follow a recorded Moonraker `file_position` feed in `@vscode/test-electron`
- [ ] Offset mapping tests: inside a line, on a layer boundary, past the end (clamped with a warning), in a `.bgcode` file (documented which offset the printer reports)
- [ ] Layer/percent mapping tests on the `.gcode.3mf` corpus
- [ ] API types are semver-checked in CI with an api-extractor report
- [ ] The position type is frozen only after the Bambu and PrusaLink field spike

## Out of scope

- Printer adapters calling `follow` (PRN, I4)
