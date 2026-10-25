---
id: 27
title: Write the RRF planner
type: feature
priority: P1
effort: M
model: sonnet
area: [planner]
story: US9
milestone: "VSS:M1"
sprint: "VSS:SP3"
depends_on: [26, 19]
created: 2026-10-25
---

Written new from reprap.org documentation and the spike note.

## Acceptance criteria

- [ ] Per-axis instantaneous speed change from M566 (mm/min) is converted correctly (unit test)
- [ ] M201/M203/M204 are honoured
- [ ] Results are labelled lower confidence until the spike says otherwise

## Tasks

- [ ] Implement planner from the note
- [ ] M566 conversion
- [ ] Tests

## Progress

Not started.
