---
id: 340
title: "Fill the history record's timelapse field"
type: feature
priority: P1
effort: M
model: sonnet
area: [history]
story: US46
milestone: "VSS:M4"
sprint: "VSS:SP35"
depends_on: [190, 211, 290]
created: 2026-10-25
---

Use case `attachTimelapse(record, finder)`: given the injected `listTimelapses(printerId, window)` (backed by `CameraSource.timelapses()` or the agent `timelapse.list` of PRN-289/290) it matches the entry for a finished job by time window and name and appends a `backfilled` event with `timelapse`. The module imports neither camera-api nor the agent.

**Code:** `vsslicer/modules/job-history/src/application/...` (module: `job-history`, layer: `application`)

## Acceptance criteria

- [ ] With a fake finder: the entry within the job's start/end window is attached; none found leaves the field empty; two candidates choose the nearest to the end time and keep the other names
- [ ] Running twice appends nothing new; a finder error is reported and loses no record
- [ ] Round-trips through the JSON Schema of PRN-182

## Tasks

- [ ] Write the matcher
- [ ] Write the use case
- [ ] Fixture tests

## Progress

Not started.
