---
id: 174
title: Add PrinterRegistry.follow
type: feature
priority: P1
effort: S
model: sonnet
area: [daemon]
story: US33
milestone: "VSS:M3"
sprint: "VSS:SP31"
depends_on: [168, 75]
created: 2026-10-25
---

Export `follow(printerId)` returning the agent's feed as an event stream.

**Code:** `vsslicer/modules/printers-extension/src/presentation/...` (module: `printers-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] A stub extension receives the feed events for a fake print; unsubscribe releases the subscription

## Tasks

- [ ] Export
- [ ] Stub test

## Progress

Not started.
