---
id: 386
title: Discover SDCP printers by UDP M99999
type: feature
priority: P2
effort: S
model: sonnet
area: [unofficial]
story: US67
milestone: "VSS:M5"
sprint: "VSS:SP32"
depends_on: [385]
created: 2026-10-25
---

A `Discoverer` that broadcasts `M99999` to UDP port 3000 and returns `Name`, `MachineName`, `MainboardIP`, `MainboardID`, `ProtocolVersion` and `FirmwareVersion`.

**Code:** `vsslicer/modules/printer-unofficial-sdcp/src/adapters/...` (module: `printer-unofficial-sdcp`, layer: `adapters`)

## Acceptance criteria

- [ ] With a fake UDP socket the recorded reply produces a discovery result with all fields; a malformed reply is skipped with a log line
- [ ] Cancel closes the socket; a network error gives `unreachable`, not a hang

## Tasks

- [ ] UDP broadcast
- [ ] Reply parser use
- [ ] Tests

## Progress

Not started.
