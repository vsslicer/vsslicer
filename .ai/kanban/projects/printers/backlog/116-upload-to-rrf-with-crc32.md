---
id: 116
title: Upload to RRF with crc32
type: feature
priority: P0
effort: S
model: sonnet
area: [duet]
story: US22
milestone: "VSS:M3"
sprint: "VSS:SP14"
depends_on: [115]
created: 2026-10-25
---

`rr_upload` with crc32 verification, progress and abort.

**Code:** `vsslicer/modules/printer-duet/src/adapters/...` (module: `printer-duet`, layer: `adapters`)

## Acceptance criteria

- [ ] Matching and mismatching crc32 fixtures; a rejected upload gives `fileRejected`
- [ ] Abort stops sending

## Tasks

- [ ] Upload
- [ ] Tests

## Progress

Not started.
