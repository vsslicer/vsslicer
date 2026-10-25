---
id: 221
title: Record queue items as history records
type: feature
priority: P2
effort: S
model: sonnet
area: [daemon, fleet, history]
story: US55
milestone: "VSS:M4"
sprint: "VSS:SP24"
depends_on: [219, 215]
created: 2026-10-25
---

Set `history_id` on dispatch so job events extend the queue item's record.

**Code:** `vsslicer/modules/printer-agent/src/application/...` (module: `printer-agent`, layer: `application`)

## Acceptance criteria

- [ ] A dispatched item produces a `sent` event with the item's plate and the later job events fold into it

## Tasks

- [ ] Link
- [ ] Tests

## Progress

Not started.
