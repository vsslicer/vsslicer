---
id: 388
title: Upload a file in 1 MB chunks with MD5
type: feature
priority: P2
effort: M
model: sonnet
area: [unofficial]
story: US67
milestone: "VSS:M5"
sprint: "VSS:SP32"
depends_on: [385]
created: 2026-10-25
---

Streams a file as multipart packets to `POST http://IP:3030/uploadFile/upload` with `S-File-MD5`, `Check`, `Offset`, `Uuid` and `TotalSize`, with progress and abort, never holding the whole file in memory.

**Code:** `vsslicer/modules/printer-unofficial-sdcp/src/adapters/...` (module: `printer-unofficial-sdcp`, layer: `adapters`)

## Acceptance criteria

- [ ] The replay harness receives the packets in order with correct offsets and MD5; progress is reported per chunk
- [ ] An MD5 mismatch response, an unknown format or a refused resolution maps to `fileRejected` with the vendor code in the cause
- [ ] Abort sends command 255 (terminate transfer)

## Tasks

- [ ] Chunker
- [ ] MD5
- [ ] Abort
- [ ] Tests

## Progress

Not started.
