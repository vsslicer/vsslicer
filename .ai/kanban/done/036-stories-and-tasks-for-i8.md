---
id: 36
title: Stories and tasks for I8
type: chore
priority: P1
effort: L
model: opus
area: [filament]
created: 2026-10-25
---

Break I8 into user-visible stories and one-commit task cards on the boards of its epics' projects, ready for `plan-sprints`.

## Acceptance criteria

- [x] Every I8 epic has stories (`epic: VSS:E<n>`) on its `project:` board covering its scope, feature-matrix rows and acceptance criteria
- [x] Task cards sized for one agent and one commit, with acceptance criteria and tasks, `effort`, `priority`, `model` and `milestone` set
- [x] Each card names its package path under `vsslicer/` and its Clean-architecture layer; no card mixes layers
- [x] `depends_on` set for every real dependency, including cross-project and M1 cards
- [x] Reviewed by the planner; `board.py check` passes on every board

## Tasks

- [x] Dispatch Sonnet workers per project
- [x] Review coverage, sizes and dependencies; send gaps back
- [x] Wire cross-project dependencies

## Progress

Done. FIL: stories US1-US38, cards FIL-1 to FIL-96, 246 points, M4. Modules `filament`, `filament-ofd`, `filament-spoolman`, `filament-extension`. Tag reading in `filament` over `printer-api` events. Gap cards on PRN (PRN-316 to 341, M4, stories on FIL) add job end and tray metadata, tag events, Moonraker Spoolman proxy, Bambu AMS mapping and extension exports, with releases PRN-320, 325, 327, 329, 334, 339, 341.
