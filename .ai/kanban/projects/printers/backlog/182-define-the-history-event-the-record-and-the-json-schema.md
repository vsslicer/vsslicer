---
id: 182
title: "Define the history event, the record and the JSON Schema"
type: feature
priority: P1
effort: M
model: sonnet
area: [history]
story: US50
milestone: "VSS:M4"
sprint: "VSS:SP30"
depends_on: [180]
created: 2026-10-25
---

Append-only events (`sent`, `started`, `ended`, `backfilled`) and the folded record: Moonraker's job shape plus `vsslicer_job_id`, `project`, `plate_index`, `printer_id`, `profile_ref`, `thumbnail`, optional `timelapse`.

**Code:** `vsslicer/modules/job-history/src/domain/...` (module: `job-history`, layer: `domain`)

## Acceptance criteria

- [ ] Types, a `v` version field and a generated, checked-in JSON Schema; property tests reject invalid lines
- [ ] Unknown newer versions are readable as unknown, never thrown away

## Tasks

- [ ] Types
- [ ] Schema generation
- [ ] Property tests

## Progress

Not started.
