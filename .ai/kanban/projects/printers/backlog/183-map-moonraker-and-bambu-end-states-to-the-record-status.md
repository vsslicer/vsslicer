---
id: 183
title: Map Moonraker and Bambu end states to the record status
type: feature
priority: P1
effort: S
model: sonnet
area: [history]
story: US50
milestone: "VSS:M4"
sprint: "VSS:SP30"
depends_on: [182]
created: 2026-10-25
---

Table from vendor job states to `completed|cancelled|failed|interrupted|in_progress`.

**Code:** `vsslicer/modules/job-history/src/domain/...` (module: `job-history`, layer: `domain`)

## Acceptance criteria

- [ ] Table test covers Moonraker `completed, cancelled, error, klippy_shutdown, klippy_disconnect, interrupted, server_exit, in_progress` and Bambu `FINISH, FAILED, IDLE, RUNNING, PAUSE`; unknown states map to `interrupted` with the raw state kept

## Tasks

- [ ] Write the table
- [ ] Table tests

## Progress

Not started.
