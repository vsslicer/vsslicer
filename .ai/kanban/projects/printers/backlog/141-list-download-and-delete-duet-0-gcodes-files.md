---
id: 141
title: "List, download and delete Duet 0:/gcodes files"
type: feature
priority: P1
effort: S
model: sonnet
area: [duet, storage]
story: US28
milestone: "VSS:M3"
sprint: "VSS:SP20"
depends_on: [118]
created: 2026-10-25
---

RRF `rr_filelist`/`rr_download`/`rr_delete` and DSF `/machine/directory`.

**Code:** `vsslicer/modules/printer/duet/src/adapters/...` (module: `printer-duet`, layer: `adapters`)

## Acceptance criteria

- [ ] Fixtures pass for both firmwares; long-name failures from the board surface as `fileRejected` with the name

## Tasks

- [ ] Operations
- [ ] Tests

## Progress

Not started.
