---
id: 397
title: Upload a model to Repetier-Server
type: feature
priority: P2
effort: S
model: sonnet
area: [unofficial]
story: US68
milestone: "VSS:M5"
sprint: "VSS:SP32"
depends_on: [395]
created: 2026-10-25
---

Multipart `POST /printer/model/<slug>?a=upload` with `name`, `group` and `filename`, `overwrite=true` where the server supports it, with progress and abort.

**Code:** `vsslicer/modules/printer-unofficial-repetier/src/adapters/...` (module: `printer-unofficial-repetier`, layer: `adapters`)

## Acceptance criteria

- [ ] The replay harness receives the multipart fields and the file bytes; a 4xx maps to `fileRejected`, 5xx to `protocol`
- [ ] Abort stops the transfer within one chunk

## Tasks

- [ ] Multipart stream
- [ ] Progress and abort
- [ ] Tests

## Progress

Not started.
