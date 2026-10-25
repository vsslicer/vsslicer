---
id: 91
title: Upload to Moonraker with checksum and optional print
type: feature
priority: P0
effort: M
model: sonnet
area: [moonraker]
story: US19
milestone: "VSS:M3"
sprint: "VSS:SP13"
depends_on: [89, 90]
created: 2026-10-25
---

Multipart upload to `server/files/upload` with progress, abort, `checksum` and `print=true`.

**Code:** `vsslicer/modules/printer-moonraker/src/adapters/...` (module: `printer-moonraker`, layer: `adapters`)

## Acceptance criteria

- [ ] A corrupted-file fixture returns 422 and surfaces as `PrinterError.fileRejected`
- [ ] Progress events and abort tested; `print=true` starts the job in the fixture

## Tasks

- [ ] Multipart stream
- [ ] Checksum
- [ ] Tests

## Progress

Not started.
