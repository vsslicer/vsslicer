---
id: 91
title: Orchestrate sync with a state machine and error surfacing
type: feature
priority: P2
effort: M
model: sonnet
area: [spoolman]
story: US35
milestone: "VSS:M4"
sprint: "VSS:SP27"
depends_on: [89, 90]
created: 2026-10-25
---

A sync service with states off, syncing, offline and error, exposing state and conflicts, with sync off by default.

**Code:** `vsslicer/modules/filament-spoolman/src/application/...` (module: `filament-spoolman`, layer: `application`)

## Acceptance criteria

- [ ] State transitions are table-tested including unreachable server, 404 spool and rejected write
- [ ] Off by default; turning sync off leaves both stores intact

## Tasks

- [ ] Write the service
- [ ] Transition tests

## Progress

Not started.
