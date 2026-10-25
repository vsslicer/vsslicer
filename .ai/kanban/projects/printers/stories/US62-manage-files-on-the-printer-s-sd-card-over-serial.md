---
id: US62
title: "Manage files on the printer's SD card over serial"
status: reviewed
epic: VSS:E59
---

As an owner of a USB-only Marlin printer, I want to list, upload, start and delete files on the SD card over the serial port, so that I can print from the card without removing it.

## Acceptance criteria

- [ ] `M20`, `M23`, `M24`, `M25`, `M27` and `M30` list, select, start, pause and delete files in the emulator
- [ ] SD upload with `M28`/`M29` writes the file byte for byte, reports progress, and an aborted upload leaves no partial file
- [ ] Binary File Transfer is used when `M115` advertises it and verified on the emulator
- [ ] SD operations are only offered when the firmware reports an SD card

## Out of scope

- Writing firmware; SD card formatting; non-Marlin firmware.
