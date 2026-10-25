---
id: 33
title: Stories and tasks for I5
type: chore
priority: P1
effort: L
model: opus
area: [slicer]
created: 2026-10-25
---

Break I5 into user-visible stories and one-commit task cards on the boards of its epics' projects, ready for `plan-sprints`.

## Acceptance criteria

- [ ] Every I5 epic has stories (`epic: VSS:E<n>`) on its `project:` board covering its scope, feature-matrix rows and acceptance criteria
- [ ] Task cards sized for one agent and one commit, with acceptance criteria and tasks, `effort`, `priority`, `model` and `milestone` set
- [ ] Each card names its package path under `vsslicer/` and its Clean-architecture layer; no card mixes layers
- [ ] `depends_on` set for every real dependency, including cross-project and M1 cards
- [ ] Reviewed by the planner; `board.py check` passes on every board

## Tasks

- [ ] Dispatch Sonnet workers per project
- [ ] Review coverage, sizes and dependencies; send gaps back
- [ ] Wire cross-project dependencies

## Progress

Not started.
