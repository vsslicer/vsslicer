---
id: 29
title: Sprint 1 proposal and gstack sync
type: chore
priority: P0
effort: M
model: opus
area: [platform]
milestone: R2
sprint: SP1
owner: coordinator
created: 2026-10-25
---

Propose Sprint 1 on the board holding most of its work, move its cards to Ready, sync gstack TODOS.md and refresh every README.

## Acceptance criteria

- [ ] sprints/SP1.md with dates, milestone, goal, status proposed, and the scope and points rationale
- [ ] Chosen cards have sprint=SP1 and sit in Ready
- [ ] board.py gstack run on VSS; readme on every board; check OK everywhere

## Tasks

- [ ] Pick scope
- [ ] Write SP1, set cards
- [ ] gstack sync, readmes

## Progress

Done with `board.py plan-sprints M1 --length 2h --apply`: SP2 to SP4, 2-hour sprints sized at the
measured 61 points an hour, 332 points over 105 cards on PLT, GCP and PRN, in dependency order. Cross-board
needs written only in prose became `depends_on` (GCP roots on PLT-2 and PLT-8, GCP-30 on PLT-15, PLT-17 and
PLT-30). M2 to M6 re-timed at the same pace (D11, proposed). Verified: `check` passes on all eight boards.
