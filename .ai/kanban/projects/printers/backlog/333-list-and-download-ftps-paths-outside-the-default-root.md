---
id: 333
title: List and download FTPS paths outside the default root
type: feature
priority: P1
effort: S
model: sonnet
area: [bambu]
story: US47
milestone: "VSS:M4"
sprint: "VSS:SP29"
depends_on: [148]
created: 2026-10-25
---

Lets a caller list and download from an explicit absolute path (the SD card `/timelapse` folder) with progress and `AbortSignal`, without widening the default root of the file operations.

**Code:** `vsslicer/modules/printer-bambu/src/adapters/...` (module: `printer-bambu`, layer: `adapters`)

## Acceptance criteria

- [ ] Against the FTPS fixture server: list and download of `/timelapse` work; a path with `..` or one that leaves the volume is rejected
- [ ] Download reports progress and cancel leaves no partial file; the default-root operations of PRN-137 are unchanged

## Tasks

- [ ] Add the path-scoped operations
- [ ] Path validation
- [ ] Fixture tests

## Progress

Not started.
