---
id: 30
title: Stories and tasks for I2
type: chore
priority: P1
effort: L
model: opus
area: [3mf, viewer]
created: 2026-10-25
---

Break I2 into user-visible stories and one-commit task cards on the boards of its epics' projects, ready for `plan-sprints`.

## Acceptance criteria

- [x] Every I2 epic has stories (`epic: VSS:E<n>`) on its `project:` board covering its scope, feature-matrix rows and acceptance criteria
- [x] Task cards sized for one agent and one commit, with acceptance criteria and tasks, `effort`, `priority`, `model` and `milestone` set
- [x] Each card names its package path under `vsslicer/` and its Clean-architecture layer; no card mixes layers
- [x] `depends_on` set for every real dependency, including cross-project and M1 cards
- [x] Reviewed by the planner; `board.py check` passes on every board

## Tasks

- [x] Dispatch Sonnet workers per project
- [x] Review coverage, sizes and dependencies; send gaps back
- [x] Wire cross-project dependencies

## Progress

Done. VWR: stories US1-US26, cards VWR-1 to VWR-76, 192 points, milestone M2 (Sonnet worker, planner review). Modules `3mf`, `mesh`, `project-extension`, each created from `tooling`; releases VWR-73 (`3mf@0.1.0` container), VWR-74 (`3mf@0.2.0` readProject), VWR-75/76 (`mesh`). Cross-module deps go through release cards. GCP-15 (M1) should depend on VWR-73: left to the SP2 coordinator.
