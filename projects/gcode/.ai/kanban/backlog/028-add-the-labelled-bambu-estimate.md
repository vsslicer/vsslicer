---
id: 28
title: Add the labelled Bambu estimate
type: feature
priority: P1
effort: M
model: sonnet
area: [planner]
story: US9
milestone: "VSS:M1"
sprint: "VSS:SP3"
depends_on: [24]
created: 2026-10-25
---

Closed firmware: Marlin model with profile jerk and accel and the file's M204/M205.

## Acceptance criteria

- [ ] Bambu files use the Marlin planner and the result carries `estimate: true` (test)
- [ ] M622/M623 conditional blocks are treated as executed and flagged
- [ ] Limits source is recorded

## Tasks

- [ ] Flavour routing
- [ ] Flag plumbing
- [ ] Tests

## Progress

Not started.
