---
id: 84
title: Subscribe to Spoolman change events with reconnect
type: feature
priority: P2
effort: M
model: sonnet
area: [spoolman]
story: US35
milestone: "VSS:M4"
depends_on: [83]
created: 2026-10-25
---

Websocket change events with reconnect and backoff; polling as the fallback.

**Code:** `vsslicer/modules/filament-spoolman/src/adapters/...` (module: `filament-spoolman`, layer: `adapters`)

## Acceptance criteria

- [ ] Contract test: edits made by a second client arrive as events
- [ ] Dropping and restoring the connection resubscribes without duplicate events

## Tasks

- [ ] Write the subscription
- [ ] Reconnect
- [ ] Contract test

## Progress

Not started.
