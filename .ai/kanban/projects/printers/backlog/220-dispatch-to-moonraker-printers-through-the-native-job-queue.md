---
id: 220
title: Dispatch to Moonraker printers through the native job queue
type: feature
priority: P2
effort: M
model: opus
area: [daemon, fleet]
story: US57
milestone: "VSS:M4"
sprint: "VSS:SP35"
depends_on: [219, 194]
created: 2026-10-25
---

For sessions with the `nativeQueue` flag, enqueue and start through the native queue and mirror its events into the item.

**Code:** `vsslicer/modules/printer/agent/src/application/...` (module: `printer-agent`, layer: `application`)

## Acceptance criteria

- [ ] Fake adapter with native queue: native state wins on disagreement
- [ ] The item mirrors `notify_job_queue_changed` changes

## Tasks

- [ ] Dispatch path
- [ ] Mirror
- [ ] Tests

## Progress

Not started.
