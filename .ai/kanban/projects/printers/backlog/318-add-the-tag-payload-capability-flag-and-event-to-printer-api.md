---
id: 318
title: Add the tag payload capability flag and event to printer-api
type: feature
priority: P1
effort: S
model: sonnet
area: [api]
story: "FIL:US32"
milestone: "VSS:M4"
sprint: "VSS:SP33"
depends_on: [194]
created: 2026-10-25
---

FIL-74 needs a way for a connector to hand over OpenPrintTag payload bytes. Adds a capability flag and a status-stream event; connectors that read tags later set the flag.

**Code:** `vsslicer/modules/printer-api/src/domain/...` (module: `printer-api`, layer: `domain`)

## Acceptance criteria

- [ ] Capability `tagPayload` (default false) and an event `{ type: 'tagPayload', printerId, source, bytes: Uint8Array, readAt }` on the event stream
- [ ] Type tests: an adapter without the flag compiles unchanged; `bytes` is carried as received (no decoding in printer-api)
- [ ] api-extractor diff is additive

## Tasks

- [ ] Add the flag
- [ ] Add the event
- [ ] Type tests

## Progress

Not started.
