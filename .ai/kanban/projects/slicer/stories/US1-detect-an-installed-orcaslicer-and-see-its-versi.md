---
id: US1
title: "Detect an installed OrcaSlicer and see its version"
status: reviewed
epic: VSS:E26
---

As a user who already has OrcaSlicer installed, I want VSSlicer to find it (or let me point at it) and tell me its version, so that I can slice without downloading anything and know whether the version is one VSSlicer was tested with.

## Acceptance criteria

- [ ] Orca is found in the standard install paths on macOS, Windows and Linux, or at `vsslicer.slicer.orca.path` when set; the setting wins
- [ ] The detected install reports its version; a version other than the pinned one shows a warning that names the pinned version and does not block slicing
- [ ] No Orca found gives a message that offers the download (US2) and the setting, never an exception
- [ ] Detection is covered by tests with stub installs on a temp file tree for each OS layout

## Out of scope

- Downloading (US2)
- Cura detection (US15)
