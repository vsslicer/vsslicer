---
id: 108
title: Upload to PrusaLink with Print-After-Upload
type: feature
priority: P0
effort: M
model: sonnet
area: [prusalink]
story: US21
milestone: "VSS:M3"
depends_on: [107]
created: 2026-10-25
---

`PUT /api/v1/files/{storage}/{path}` with progress, abort and the `Print-After-Upload` header.

**Code:** `vsslicer/modules/printer-prusalink/src/adapters/...` (module: `printer-prusalink`, layer: `adapters`)

## Acceptance criteria

- [ ] `Print-After-Upload: ?0` never starts a print (regression for the firmware bug PrusaSlicer works around)
- [ ] Progress, abort and 409 (file exists) handled

## Tasks

- [ ] PUT stream
- [ ] Header handling
- [ ] Regression test

## Progress

Not started.
