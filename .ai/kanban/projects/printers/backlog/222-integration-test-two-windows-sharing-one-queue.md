---
id: 222
title: Integration-test two windows sharing one queue
type: chore
priority: P2
effort: M
model: sonnet
area: [daemon, fleet]
story: US55
milestone: "VSS:M4"
sprint: "VSS:SP34"
depends_on: [220, 221]
created: 2026-10-25
---

Two protocol clients add and watch items.

**Code:** `vsslicer/modules/printer-agent/src/application/...` (module: `printer-agent`, layer: `application`)

## Acceptance criteria

- [ ] An item added in one window appears in the other and dispatches once
- [ ] A transient agent restart keeps the queue

## Tasks

- [ ] Harness
- [ ] Tests

## Progress

Not started.
