---
id: 435
title: Discover Snapmaker machines by UDP broadcast
type: feature
priority: P2
effort: S
model: sonnet
area: [unofficial]
story: US72
milestone: "VSS:M5"
sprint: "VSS:SP46"
depends_on: [434]
created: 2026-10-25
---

A `Discoverer` that broadcasts `discover` to UDP port 20054 and parses `name@ip|key:value...` replies.

**Code:** `vsslicer/modules/printer/unofficial-snapmaker/src/adapters/...` (module: `printer-unofficial-snapmaker`, layer: `adapters`)

## Acceptance criteria

- [ ] With a fake UDP socket the recorded reply produces results with model and name; malformed replies are skipped
- [ ] Cancel closes the socket

## Tasks

- [ ] UDP broadcast
- [ ] Reply parser
- [ ] Tests

## Progress

Not started.
