---
id: US63
title: "Use the printer's long file names when exporting to its SD card"
status: reviewed
epic: VSS:E59
---

As an owner of a USB-only Marlin printer, I want VSSlicer to know whether the firmware supports long file names, so that Export to drive or folder keeps readable names when they will work and falls back to 8.3 names when they will not.

## Acceptance criteria

- [ ] `M115` replies recorded from Marlin 1.1.x and 2.x builds map to the `longFilenames` capability (`LONG_FILENAME`, `LFN_WRITE`, `EXTENDED_M20`)
- [ ] The capability is published through `@vsslicer/printer-api` and read by Export to drive or folder as the sanitiser default
- [ ] An explicit connection setting still overrides the detected value

## Out of scope

- Changing the sanitiser itself (E24).
