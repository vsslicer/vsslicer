---
id: 65
title: Host printer sessions once and fan status out to many windows
type: feature
priority: P1
effort: M
model: opus
area: [daemon]
story: US16
milestone: "VSS:M3"
depends_on: [63, 14]
created: 2026-10-25
---

Session manager over the printer-api hub: one adapter connection per printer however many clients subscribe.

**Code:** `vsslicer/modules/printer-agent/src/application/...` (module: `printer-agent`, layer: `application`)

## Acceptance criteria

- [ ] Two subscribers to one printer see the same status and the fake server counts one connection; the last unsubscribe closes it after a grace period
- [ ] A client disconnect drops only its subscriptions

## Tasks

- [ ] Session manager
- [ ] Fan-out
- [ ] Tests with the fake adapter

## Progress

Not started.
