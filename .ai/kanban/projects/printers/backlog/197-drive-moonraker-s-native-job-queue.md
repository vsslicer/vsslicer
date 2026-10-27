---
id: 197
title: "Drive Moonraker's native job queue"
type: feature
priority: P2
effort: M
model: sonnet
area: [moonraker]
story: US57
milestone: "VSS:M4"
sprint: "VSS:SP34"
depends_on: [195, 194]
created: 2026-10-25
---

`server/job_queue/*` calls and `notify_job_queue_changed` as the `nativeQueue` member.

**Code:** `vsslicer/modules/printer/moonraker/src/adapters/...` (module: `printer-moonraker`, layer: `adapters`)

## Acceptance criteria

- [ ] Contract tests against the recorded fixtures: status, job add and remove, start, pause, jump; queue changes arrive as events
- [ ] Errors map to `PrinterError` kinds

## Tasks

- [ ] Client
- [ ] Events
- [ ] Contract tests

## Progress

Not started.
