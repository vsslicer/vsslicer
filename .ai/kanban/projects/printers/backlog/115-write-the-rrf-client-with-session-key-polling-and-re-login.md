---
id: 115
title: "Write the RRF client with session key, polling and re-login"
type: feature
priority: P0
effort: M
model: sonnet
area: [duet]
story: US22
milestone: "VSS:M3"
sprint: "VSS:SP20"
depends_on: [114, 113]
created: 2026-10-25
---

Standalone RRF `rr_*` with session handling and polling.

**Code:** `vsslicer/modules/printer-duet/src/adapters/...` (module: `printer-duet`, layer: `adapters`)

## Acceptance criteria

- [ ] Session expiry mid-poll triggers one re-login and the call succeeds (fixture)
- [ ] Wrong password gives `PrinterError.auth`; all calls have timeouts

## Tasks

- [ ] Session handling
- [ ] Polling
- [ ] Tests

## Progress

Not started.
