---
id: 86
title: Push entity edits to Spoolman
type: feature
priority: P2
effort: M
model: sonnet
area: [spoolman]
story: US35
milestone: "VSS:M4"
sprint: "VSS:SP32"
depends_on: [85]
created: 2026-10-25
---

Local creates, edits and archives pushed with CRUD; every push logged.

**Code:** `vsslicer/modules/filament-spoolman/src/application/...` (module: `filament-spoolman`, layer: `application`)

## Acceptance criteria

- [ ] Contract test: a local edit appears in Spoolman and the paired ids stay stable
- [ ] A 404 on the remote spool surfaces as a typed sync error, not a silent skip

## Tasks

- [ ] Write the pusher
- [ ] Contract tests

## Progress

Not started.
