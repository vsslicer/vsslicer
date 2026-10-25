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

- [x] Every I5 epic has stories (`epic: VSS:E<n>`) on its `project:` board covering its scope, feature-matrix rows and acceptance criteria
- [x] Task cards sized for one agent and one commit, with acceptance criteria and tasks, `effort`, `priority`, `model` and `milestone` set
- [x] Each card names its package path under `vsslicer/` and its Clean-architecture layer; no card mixes layers
- [x] `depends_on` set for every real dependency, including cross-project and M1 cards
- [x] Reviewed by the planner; `board.py check` passes on every board

## Tasks

- [x] Dispatch Sonnet workers per project
- [x] Review coverage, sizes and dependencies; send gaps back
- [x] Wire cross-project dependencies

## Progress

Done. SLC: stories US1-US35, cards SLC-1 to SLC-130, 326 points, M3. Modules `slicer-api`, `slicer-runtime`, `slicer-orca`, `slicer-output` (`.gcode.3mf` assembly), `cura-settings`, `slicer-cura`, `slicer-extension`. Wired to the PRF releases (PRF-135, PRF-140), VWR-73/74/63 and PRN-14/28/48/60.
