---
id: 191
title: Add the history and native queue capability flags and value types
type: feature
priority: P2
effort: S
model: sonnet
area: [api]
story: US57
milestone: "VSS:M4"
sprint: "VSS:SP33"
depends_on: [14]
created: 2026-10-25
---

Optional capability flags `history` and `nativeQueue`, and the `NativeJob` (job_id, filename, status, start_time, end_time, print_duration, filament_used) and `NativeQueueItem` types.

**Code:** `vsslicer/modules/printer-api/src/domain/...` (module: `printer-api`, layer: `domain`)

## Acceptance criteria

- [ ] Type tests; the flags are marked read-only-safe or not as in the existing flags

## Tasks

- [ ] Flags
- [ ] Types
- [ ] Type tests

## Progress

Not started.
