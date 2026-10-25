---
id: US16
title: "A user imports from the slicers already installed, read-only"
status: reviewed
epic: VSS:E12
---

A user with PrusaSlicer, Orca, Bambu Studio or Cura installed lets VSSlicer find their configuration folders on macOS, Windows or Linux and import from them, with the originals never touched.

## Acceptance criteria

- [ ] Fixture folders for each OS layout and each of the five slicers are located and read
- [ ] A checksum of the source tree is identical after import
- [ ] An unreadable folder gives a diagnostic and the rest import

## Out of scope

- Writing to native folders (never).
