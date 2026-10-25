---
id: 9
title: Write the session hub that wraps adapter calls
type: feature
priority: P0
effort: M
model: opus
area: [api]
story: US4
milestone: "VSS:M3"
depends_on: [6]
created: 2026-10-25
---

Plain-Node hub shared by the extension (in-process) and the agent: opens sessions, wraps every adapter call, fans status out.

**Code:** `vsslicer/modules/printer-api/src/application/...` (module: `printer-api`, layer: `application`)

## Acceptance criteria

- [ ] Every adapter call has a timeout; a throw or rejection becomes a `PrinterError` (no unhandled rejection), asserted with a throwing fake
- [ ] `subscribe`/`unsubscribe` fan status events out to many listeners with one adapter subscription; poll-only adapters are polled internally
- [ ] Nothing heavy runs on the caller's thread: a test with a slow adapter shows other sessions are not blocked

## Tasks

- [ ] Write the hub
- [ ] Timeouts and error wrapping
- [ ] Fan-out tests

## Progress

Not started.
