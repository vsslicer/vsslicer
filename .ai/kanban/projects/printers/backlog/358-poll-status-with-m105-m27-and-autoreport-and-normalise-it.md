---
id: 358
title: "Poll status with M105, M27 and autoreport and normalise it"
type: feature
priority: P2
effort: M
model: sonnet
area: [serial]
story: US61
milestone: "VSS:M5"
sprint: "VSS:SP43"
depends_on: [357]
created: 2026-10-25
---

Temperatures and SD progress become the normalised `PrinterStatus` with the vendor state kept alongside. Polling pauses while the window is saturated; `M155` autoreport is used when advertised.

**Code:** `vsslicer/modules/printer-serial/src/application/...` (module: `printer-serial`, layer: `application`)

## Acceptance criteria

- [ ] Temperature, target and printing/idle/paused states map from the emulator on idle, streaming and SD printing (table test)
- [ ] Polling never writes a line out of order into the numbered stream (the poll is framed like any other line, test)
- [ ] Autoreport replaces polling when `AUTOREPORT_TEMP` is advertised

## Tasks

- [ ] Poller
- [ ] Normalisation tables
- [ ] Tests

## Progress

Not started.
