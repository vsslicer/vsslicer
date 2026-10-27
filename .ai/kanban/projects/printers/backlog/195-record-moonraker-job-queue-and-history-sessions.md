---
id: 195
title: Record Moonraker job queue and history sessions
type: chore
priority: P1
effort: S
model: sonnet
area: [moonraker]
story: US57
milestone: "VSS:M4"
sprint: "VSS:SP31"
depends_on: [149]
created: 2026-10-25
---

Recorded HTTP and WebSocket sessions for `server/job_queue/status`, `post_job`, `delete_job`, `start`, `pause`, `jump` and `notify_job_queue_changed`, and `server/history/list`.

**Code:** fixtures path `vsslicer/modules/printer/moonraker/test/fixtures/job-queue/` (layer: n/a (fixtures))

## Acceptance criteria

- [ ] Fixtures under `test/fixtures/` with the Moonraker version recorded; secrets scrubbed (grep test)
- [ ] A bridge-free replay test loads each

## Tasks

- [ ] Record
- [ ] Scrub
- [ ] Replay test

## Progress

Not started.
