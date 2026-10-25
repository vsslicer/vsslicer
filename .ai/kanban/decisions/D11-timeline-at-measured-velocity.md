---
id: D11
title: Plan time at measured agent speed, in two-hour sprints
status: proposed
date: 2026-10-25
---

## Context

D8 dated the milestones at human pace: M1 to M6 ran from November 2026 to June 2028. The work
is done by agents. Research (R1, sprint SP0) finished 72 points in 71 minutes, 16:55 to 18:06, and
planning (R2) 51 points in 31 minutes. Dates stated in days hid that research and planning ran
one after the other on the same afternoon.

## Decision

- Board times are written to the minute (`2026-10-25T19:15+00:00`), and sprints are measured in hours.
- Sprints run **2 hours**. Their size is the measured velocity, points finished per hour across
  closed sprints (61 points an hour after SP0), times the sprint length. Each sprint close remeasures it.
- A milestone is the sprints that make it up: `board.py plan-sprints` sets its start and due.
  M1 is planned: SP2 to SP4, 19:15 on 25 October to 01:15 on 26 October, 332 points.
- Milestones without task cards yet (M2 to M6) are estimated at M1's 47 points per epic, at the
  same velocity, paced at **8 agent hours a day**: M2 by 27 October 03:15, M3 by 28 October 08:15,
  M4 by 30 October 00:15, M5 by 31 October 23:15, M6 by 1 November 04:15. Each milestone is
  re-planned from its real cards when its initiative's stories and tasks are written.
- The roadmap view shows at most three months either side of now.

## Open to change

- **8 agent hours a day** is a placeholder. The weekly token limit, now reported to the dashboard,
  will set the real figure. Research cost about $150 at API prices for 72 points, so the full
  roadmap's roughly 3,300 points could need several weeks of limits rather than days.
- **Velocity comes from research and planning.** Writing, testing and reviewing code will likely run
  slower. SP2's close gives the first implementation figure.
- **Owner review gates** (approvals, accounts, hardware) aren't in the estimate.
