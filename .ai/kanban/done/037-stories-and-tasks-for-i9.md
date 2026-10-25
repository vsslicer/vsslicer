---
id: 37
title: Stories and tasks for I9
type: chore
priority: P1
effort: M
model: opus
area: [printers]
created: 2026-10-25
---

Break I9 into user-visible stories and one-commit task cards on the boards of its epics' projects, ready for `plan-sprints`.

## Acceptance criteria

- [x] Every I9 epic has stories (`epic: VSS:E<n>`) on its `project:` board covering its scope, feature-matrix rows and acceptance criteria
- [x] Task cards sized for one agent and one commit, with acceptance criteria and tasks, `effort`, `priority`, `model` and `milestone` set
- [x] Each card names its package path under `vsslicer/` and its Clean-architecture layer; no card mixes layers
- [x] `depends_on` set for every real dependency, including cross-project and M1 cards
- [x] Reviewed by the planner; `board.py check` passes on every board

## Tasks

- [x] Dispatch Sonnet workers per project
- [x] Review coverage, sizes and dependencies; send gaps back
- [x] Wire cross-project dependencies

## Progress

Done. PRN: stories US50-US59, cards PRN-180 to PRN-240, 141 points, M4. Modules `job-history`, `fleet-queue`; additions to `printer-api` (0.3.0), `printer-moonraker` (0.3.0), `printer-agent` (0.4.0/0.5.0 for history and queue) and `printers-extension` (0.6.0/0.7.0). Material checks wired to FIL-46, camera thumbnails to PRN-304.
