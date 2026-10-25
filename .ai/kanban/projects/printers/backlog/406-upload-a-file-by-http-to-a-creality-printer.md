---
id: 406
title: Upload a file by HTTP to a Creality printer
type: feature
priority: P2
effort: S
model: sonnet
area: [unofficial]
story: US69
milestone: "VSS:M5"
sprint: "VSS:SP45"
depends_on: [404]
created: 2026-10-25
---

`POST /upload/<name>` as a stream with progress and abort, with a filename made safe for the printer's file system.

**Code:** `vsslicer/modules/printer-unofficial-creality/src/adapters/...` (module: `printer-unofficial-creality`, layer: `adapters`)

## Acceptance criteria

- [ ] The replay harness receives the bytes; a non-2xx maps to `fileRejected`
- [ ] A name with characters the printer rejects is sanitised and the caller is told the final name

## Tasks

- [ ] Streaming upload
- [ ] Name handling
- [ ] Tests

## Progress

Not started.
