---
id: 98
title: Write the OctoPrint REST and SockJS push client
type: feature
priority: P0
effort: M
model: sonnet
area: [octoprint]
story: US20
milestone: "VSS:M3"
sprint: "VSS:SP18"
depends_on: [97, 96]
created: 2026-10-25
---

REST with `X-Api-Key` and the SockJS push channel, timeouts and reconnect.

**Code:** `vsslicer/modules/printer-octoprint/src/adapters/...` (module: `printer-octoprint`, layer: `adapters`)

## Acceptance criteria

- [ ] Push messages update status; falls back to polling if SockJS fails; every request has a timeout

## Tasks

- [ ] REST client
- [ ] SockJS client
- [ ] Tests

## Progress

Not started.
