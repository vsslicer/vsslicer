---
id: 165
title: "Run the queue: FIFO per printer, parallel across printers"
type: feature
priority: P1
effort: M
model: opus
area: [daemon]
story: US31
milestone: "VSS:M3"
sprint: "VSS:SP24"
depends_on: [163, 164, 65]
created: 2026-10-25
---

The runner that uploads through the session hub, emits progress and honours cancel.

**Code:** `vsslicer/modules/printer/agent/src/application/...` (module: `printer-agent`, layer: `application`)

## Acceptance criteria

- [ ] Integration with the fake adapter: progress events reach two subscribers; cancel aborts the stream (fake server sees the connection closed)
- [ ] Three items to two printers: per-printer order kept, printers in parallel

## Tasks

- [ ] Runner
- [ ] Cancel
- [ ] Tests

## Progress

Not started.
