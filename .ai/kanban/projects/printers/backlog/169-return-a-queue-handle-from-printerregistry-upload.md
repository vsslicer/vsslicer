---
id: 169
title: Return a queue handle from PrinterRegistry.upload
type: feature
priority: P1
effort: S
model: sonnet
area: [daemon]
story: US35
milestone: "VSS:M3"
sprint: "VSS:SP29"
depends_on: [168, 75]
created: 2026-10-25
---

`PrinterRegistry.upload` queues through the agent and returns a handle (state, progress, cancel); direct upload stays behind a setting.

**Code:** `vsslicer/modules/printers-extension/src/presentation/...` (module: `printers-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] Handle documented and typed; direct upload setting works with the in-process path
- [ ] A stub extension queues an upload and cancels it

## Tasks

- [ ] Handle
- [ ] Setting
- [ ] Stub test

## Progress

Not started.
