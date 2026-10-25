---
id: 121
title: Discover printers over mDNS
type: feature
priority: P1
effort: M
model: sonnet
area: [discovery]
story: US23
milestone: "VSS:M3"
depends_on: [120, 14]
created: 2026-10-25
---

A `Discoverer` for `_moonraker._tcp`, `_octoprint._tcp` and `_http._tcp` using `bonjour-service` (MIT).

**Code:** `vsslicer/modules/printer-discovery/src/adapters/...` (module: `printer-discovery`, layer: `adapters`)

## Acceptance criteria

- [ ] Tests with in-process `multicast-dns` responders for each service type return host, port and TXT data
- [ ] Stops cleanly on dispose; no listener leaks

## Tasks

- [ ] Discoverer
- [ ] Responder tests

## Progress

Not started.
