---
id: 34
title: Stories and tasks for I6
type: chore
priority: P1
effort: L
model: opus
area: [projects, viewer]
created: 2026-10-25
---

Break I6 into user-visible stories and one-commit task cards on the boards of its epics' projects, ready for `plan-sprints`.

## Acceptance criteria

- [x] Every I6 epic has stories (`epic: VSS:E<n>`) on its `project:` board covering its scope, feature-matrix rows and acceptance criteria
- [x] Task cards sized for one agent and one commit, with acceptance criteria and tasks, `effort`, `priority`, `model` and `milestone` set
- [x] Each card names its package path under `vsslicer/` and its Clean-architecture layer; no card mixes layers
- [x] `depends_on` set for every real dependency, including cross-project and M1 cards
- [x] Reviewed by the planner; `board.py check` passes on every board

## Tasks

- [x] Dispatch Sonnet workers per project
- [x] Review coverage, sizes and dependencies; send gaps back
- [x] Wire cross-project dependencies

## Progress

Done. VWR: stories US30-US70, cards VWR-77 to VWR-272, 487 points, M4. E31 writer joins `3mf` (releases VWR-91, 98, 170); repair joins `mesh` (VWR-134, 237, 244); new modules `arrange` (VWR-202, releases VWR-214, 219) and `mesh-step` (VWR-251, VWR-263); editor in `project-extension` (releases VWR-129 to 272). Slice commands wired to SLC-106/125.
