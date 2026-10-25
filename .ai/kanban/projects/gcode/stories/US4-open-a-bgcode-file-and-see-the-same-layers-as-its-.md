---
id: US4
title: "Open a .bgcode file and see the same layers as its .gcode twin"
status: reviewed
epic: VSS:E3
---

As a PrusaSlicer or Buddy user, I want binary G-code to open exactly like text G-code, so the format never matters to the preview.

## Acceptance criteria

- [ ] Every PrusaSlicer `.bgcode` fixture decodes to the same G-code lines as its `.gcode` twin and all metadata blocks are exposed
- [ ] CRC failure, unknown block type, unknown compression and truncated block each raise a typed diagnostic
- [ ] Heatshrink 11-4 and 12-4 and MeatPack (with and without comments) decode vectors from the fixtures; a corrupted stream fails with a diagnostic, never a hang
- [ ] The Slicer3 JSON metadata block is exposed
- [ ] Inflate sits behind a codec interface

## Out of scope

- Writing `.bgcode` (SLC)
