---
id: 363
title: Upload a file to the SD card with M28 and M29
type: feature
priority: P2
effort: M
model: sonnet
area: [serial]
story: US62
milestone: "VSS:M5"
sprint: "VSS:SP43"
depends_on: [362, 351]
created: 2026-10-25
---

Streams a file into `M28 <name>` ... `M29` with progress and abort. How the firmware treats line numbers and checksums while writing is checked against `Marlin@2ef3ee6:Marlin/src/gcode/sd/M28_M29.cpp` and `Marlin/src/gcode/queue.cpp` (read, not copied) and recorded in the module README.

**Code:** `vsslicer/modules/printer-serial/src/application/...` (module: `printer-serial`, layer: `application`)

## Acceptance criteria

- [ ] The emulator's card holds the exact bytes of the source file after upload, including with injected line noise
- [ ] Abort sends `M29`, deletes the partial file with `M30` and the list shows none; a card write error from the emulator gives `fileRejected`
- [ ] A name longer than the firmware accepts is shortened with the printer-folder rule only when `longFilenames` is false (test), never silently truncated otherwise

## Tasks

- [ ] Writer
- [ ] Abort cleanup
- [ ] Name handling
- [ ] Tests

## Progress

Not started.
