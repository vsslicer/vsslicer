---
id: 407
title: Discover Creality printers by DNS-SD and GET /info
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

A `Discoverer` that looks for DNS-SD service names starting `Creality` and confirms each with `GET http://<ip>/info`.

**Code:** `vsslicer/modules/printer-unofficial-creality/src/adapters/...` (module: `printer-unofficial-creality`, layer: `adapters`)

## Acceptance criteria

- [ ] Fake DNS-SD answers plus the recorded `/info` produce discovery results; a host that fails `/info` is dropped
- [ ] Cancel stops the browse

## Tasks

- [ ] DNS-SD query
- [ ] Probe
- [ ] Tests

## Progress

Not started.
