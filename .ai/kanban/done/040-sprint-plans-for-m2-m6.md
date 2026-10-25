---
id: 40
title: Sprint plans for M2-M6
type: chore
priority: P1
effort: M
model: opus
area: [platform]
created: 2026-10-25
---

Sort the cards of M2 to M6 into two-hour sprints at the measured velocity, milestone by milestone.

## Acceptance criteria

- [x] `plan-sprints` dry run checked for each milestone (no cycles, no card before its dependencies), then applied
- [x] Milestones M2 to M6 planned in order, each starting after the last planned sprint
- [x] Milestone start and due dates follow the plan
- [x] Owner-only questions recorded as proposed decisions with a recommended default

## Tasks

- [x] Plan M2, M3, M4, M5, M6 in order
- [x] Fix dependency problems found in dry runs

## Progress

Done. Planned in order at the measured 68 points/hour, 2-hour sprints of up to 135 points:
- M2 SP5-SP9, 26 Oct 01:15 to 11:15, 220 cards, 585 points (PRF-94 and PRF-146 belong to M3)
- M3 SP10-SP16, 26 Oct 11:15 to 27 Oct 01:15, 341 cards, 810 points (PRN-1 stays in M1/SP3)
- M4 SP17-SP25, 27 Oct 01:15 to 19:15, 454 cards, 1098 points
- M5 SP26-SP34, 27 Oct 19:15 to 28 Oct 13:15, 441 cards, 1082 points
- M6 SP35-SP36, 28 Oct 13:15 to 17:15, 66 cards, 158 points
Dry runs found one cycle (PRN-335 to PRN-240 via the camera thumbnail), broken by depending on PRN-179. The proposed decisions are D13 (deferred P3 epics), D14 (owner time for fixtures and H2C sessions) and D15 (product defaults). plan-sprints counts a card for every milestone its lineage reaches, so an explicit milestone that differs from its initiative's (PRF-94, PRF-146, PRN-1) has to be checked by hand on every re-plan.
