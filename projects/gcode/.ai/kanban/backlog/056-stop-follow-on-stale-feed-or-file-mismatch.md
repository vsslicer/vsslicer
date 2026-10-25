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
