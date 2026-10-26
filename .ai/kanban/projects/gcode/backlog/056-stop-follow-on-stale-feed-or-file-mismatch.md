---
id: 56
title: Stop follow on stale feed or file mismatch
type: feature
priority: P1
effort: S
model: sonnet
area: [live]
story: US18
milestone: "VSS:M1"
sprint: "VSS:SP12"
depends_on: [55]
created: 2026-10-25
---

Zero silent failures.

## Acceptance criteria

- [ ] No update for a set time stops follow with a message (test)
- [ ] Size or MD5 mismatch with the printer's file stops follow with a message (test)
- [ ] A position out of range shows a message (test)

## Tasks

- [ ] Timer
- [ ] Mismatch check
- [ ] Messages

## Progress

Not started.
- Moved SP5 to SP6 at SP5 start: dependency-blocked in SP5 (rule 7): depends on GCP-55 (moved to SP6).
