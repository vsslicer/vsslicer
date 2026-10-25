---
id: US26
title: "A user exports a sliced file to a drive or folder with names the printer can read"
status: reviewed
epic: VSS:E24
---

As a user whose printer reads an SD card or a USB stick, I want 'Export to drive or folder' to write the file under a name the firmware can read, so that the printer lists my file.

## Acceptance criteria

- [ ] Property tests (fast-check) for name sanitisation: output always 8.3-valid in FAT mode, idempotent, collision-free in a directory, extension preserved, no reserved device names
- [ ] Long names are used only when the connection sets `longFilenames`
- [ ] FAT32 image test: export into a mounted loopback FAT image (Linux CI) and read the directory back; long names off produce 8.3 entries only
- [ ] Export to any folder works; the command is a printer adapter with only `upload`

## Out of scope

- Marlin `M115` long-filename detection and SD over serial (E59).
