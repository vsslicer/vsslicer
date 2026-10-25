---
id: 137
title: "List, download and delete files over FTPS"
type: feature
priority: P1
effort: M
model: sonnet
area: [bambu, storage]
story: US28
milestone: "VSS:M3"
sprint: "VSS:SP14"
depends_on: [43, 47]
created: 2026-10-25
---

`listFiles`, `downloadFile`, `deleteFile` and `fileMetadata` for the H2C's storage over the FTPS client.

**Code:** `vsslicer/modules/printer-bambu/src/adapters/...` (module: `printer-bambu`, layer: `adapters`)

## Acceptance criteria

- [ ] Against the local FTPS server: list, download with progress, delete; `.gcode.3mf` thumbnails returned as metadata
- [ ] Capability flags added to the adapter and the kit checks pass

## Tasks

- [ ] List and metadata
- [ ] Download
- [ ] Delete

## Progress

Not started.
