---
id: 173
title: Integration-test the queue across two fixture printers and a reload
type: chore
priority: P1
effort: M
model: sonnet
area: [daemon]
story: US32
milestone: "VSS:M3"
sprint: "VSS:SP31"
depends_on: [170, 171, 172, 149, PLT-15]
created: 2026-10-25
---

Three queued uploads to two fixture printers.

**Code:** `vsslicer/modules/apps/printers/src/presentation/...` (module: `printers-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] Three uploads complete in the background with visible progress, one is cancelled and one fails then is retried; the queue survives a window reload

## Tasks

- [ ] Suite
- [ ] Reload step

## Progress

Not started.
