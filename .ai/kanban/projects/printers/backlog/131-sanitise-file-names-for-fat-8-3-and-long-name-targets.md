---
id: 131
title: Sanitise file names for FAT 8.3 and long-name targets
type: feature
priority: P0
effort: M
model: sonnet
area: [storage]
story: US26
milestone: "VSS:M3"
sprint: "VSS:SP20"
depends_on: [130]
created: 2026-10-25
---

Pure name sanitiser: ASCII fold, reserved device names, collisions in a directory, extension kept, 8.3 by default, long names when the connection sets `longFilenames`.

**Code:** `vsslicer/modules/printer-folder/src/domain/...` (module: `printer-folder`, layer: `domain`)

## Acceptance criteria

- [ ] Property tests (fast-check): FAT-mode output is always 8.3-valid, idempotent, collision-free within a directory, extension preserved, never a reserved device name (CON, PRN, AUX, NUL, COM1-9, LPT1-9)
- [ ] Long-name mode keeps the name up to 255 characters and still strips illegal characters
- [ ] Examples table covers non-ASCII, trailing dots and spaces, and `.gcode.3mf`

## Tasks

- [ ] Sanitiser
- [ ] Collision resolver
- [ ] Property tests

## Progress

Not started.
