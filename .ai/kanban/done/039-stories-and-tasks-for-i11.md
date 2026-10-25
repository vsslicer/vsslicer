---
id: 39
title: Stories and tasks for I11
type: chore
priority: P1
effort: M
model: opus
area: [platform]
created: 2026-10-25
---

Break I11 into user-visible stories and one-commit task cards on the boards of its epics' projects, ready for `plan-sprints`.

## Acceptance criteria

- [x] Every I11 epic has stories (`epic: VSS:E<n>`) on its `project:` board covering its scope, feature-matrix rows and acceptance criteria
- [x] Task cards sized for one agent and one commit, with acceptance criteria and tasks, `effort`, `priority`, `model` and `milestone` set
- [x] Each card names its package path under `vsslicer/` and its Clean-architecture layer; no card mixes layers
- [x] `depends_on` set for every real dependency, including cross-project and M1 cards
- [x] Reviewed by the planner; `board.py check` passes on every board

## Tasks

- [x] Dispatch Sonnet workers per project
- [x] Review coverage, sizes and dependencies; send gaps back
- [x] Wire cross-project dependencies

## Progress

Done. PLT: stories US60-US69, cards PLT-110 to PLT-175, 158 points, M6. Modules `openvsx-registry` (releases PLT-126, PLT-131), `vsslicer-build`, `themes` (PLT-144). Hosting and signing cards (PLT-129 to 131, PLT-170 to 175) are blocked on the budget spike PLT-128 (D5) and carry unsigned/local fallbacks. The build bundles each extension's last M5 card or release (PLT-159).
