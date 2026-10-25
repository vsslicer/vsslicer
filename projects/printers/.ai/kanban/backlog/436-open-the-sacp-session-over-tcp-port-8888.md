---
id: 436
title: Open the SACP session over TCP port 8888
type: feature
priority: P2
effort: M
model: opus
area: [unofficial]
story: US72
milestone: "VSS:M5"
sprint: "VSS:SP32"
depends_on: [434]
created: 2026-10-25
---

SACP client over TCP (through the vetted SDK or our own codec, per the spike): connect, status requests, and the file-send and start-print sequence with progress and abort.

**Code:** `vsslicer/modules/printer-unofficial-snapmaker/src/adapters/...` (module: `printer-unofficial-snapmaker`, layer: `adapters`)

## Acceptance criteria

- [ ] Against a fake SACP server built from the fixtures, connect and status work and a file send delivers the exact bytes
- [ ] A dropped connection reconnects; a refused one maps to `unreachable`
- [ ] If the SDK is used it is pinned, integrity-checked and imported only in this layer

## Tasks

- [ ] Client
- [ ] File send
- [ ] Reconnect
- [ ] Tests

## Progress

Not started.
