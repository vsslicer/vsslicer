---
id: 204
title: Pick the printer for a target
type: feature
priority: P2
effort: S
model: sonnet
area: [fleet]
story: US56
milestone: "VSS:M4"
depends_on: [202, 203]
created: 2026-10-25
---

From a target, the printers' facts and states, choose the first idle compatible printer; `any` marks the choice as needing confirmation.

**Code:** `vsslicer/modules/fleet-queue/src/domain/...` (module: `fleet-queue`, layer: `domain`)

## Acceptance criteria

- [ ] `any` picks the first idle match and flags `needsConfirmation`; a group only considers its members; no idle match leaves the item `ready` with the reasons
- [ ] Busy and offline printers are never chosen

## Tasks

- [ ] Chooser
- [ ] Tests

## Progress

Not started.
