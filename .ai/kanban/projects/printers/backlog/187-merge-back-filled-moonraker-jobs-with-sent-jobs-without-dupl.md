---
id: 187
title: Merge back-filled Moonraker jobs with sent jobs without duplicates
type: feature
priority: P1
effort: M
model: sonnet
area: [history]
story: US52
milestone: "VSS:M4"
sprint: "VSS:SP22"
depends_on: [186]
created: 2026-10-25
---

Map a native job (`job_id, filename, status, start_time, ...`) to a `backfilled` event and merge it into the sent record that matches on printer plus `start_time`.

**Code:** `vsslicer/modules/job-history/src/application/...` (module: `job-history`, layer: `application`)

## Acceptance criteria

- [ ] A back-filled job matching a sent job by printer plus `start_time` (small tolerance) merges, no duplicate (test)
- [ ] Running the merge twice adds nothing (idempotence test)
- [ ] Unmatched jobs become new records marked as back-filled

## Tasks

- [ ] Matcher
- [ ] Merge
- [ ] Tests

## Progress

Not started.
