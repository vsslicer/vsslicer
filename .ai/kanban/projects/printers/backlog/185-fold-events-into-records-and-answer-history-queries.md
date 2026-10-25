---
id: 185
title: Fold events into records and answer history queries
type: feature
priority: P1
effort: M
model: sonnet
area: [history]
story: US50
milestone: "VSS:M4"
sprint: "VSS:SP22"
depends_on: [183, 184]
created: 2026-10-25
---

The `History` use cases: `append(event)`, `query({month, project, printer, status})` and change events, folding events by `vsslicer_job_id`.

**Code:** `vsslicer/modules/job-history/src/application/...` (module: `job-history`, layer: `application`)

## Acceptance criteria

- [ ] Query by month, project and printer returns folded records in time order (fixture files)
- [ ] Events for one job arriving out of order fold to the same record (property test)
- [ ] `History` is typed for the queue and filament consumption to reference `vsslicer_job_id`

## Tasks

- [ ] Fold
- [ ] Queries
- [ ] Tests

## Progress

Not started.
