---
id: 35
title: Stories and tasks for I7
type: chore
priority: P1
effort: M
model: opus
area: [camera]
created: 2026-10-25
---

Break I7 into user-visible stories and one-commit task cards on the boards of its epics' projects, ready for `plan-sprints`.

## Acceptance criteria

- [x] Every I7 epic has stories (`epic: VSS:E<n>`) on its `project:` board covering its scope, feature-matrix rows and acceptance criteria
- [x] Task cards sized for one agent and one commit, with acceptance criteria and tasks, `effort`, `priority`, `model` and `milestone` set
- [x] Each card names its package path under `vsslicer/` and its Clean-architecture layer; no card mixes layers
- [x] `depends_on` set for every real dependency, including cross-project and M1 cards
- [x] Reviewed by the planner; `board.py check` passes on every board

## Tasks

- [x] Dispatch Sonnet workers per project
- [x] Review coverage, sizes and dependencies; send gaps back
- [x] Wire cross-project dependencies

## Progress

Done. PRN: stories US40-US49, cards PRN-241 to PRN-315, 178 points, M4. Modules `camera-api`, `camera-mjpeg`, `camera-bambu`, `camera-webrtc`, `camera-timelapse`, `camera-extension`; agent camera methods in `printer-agent`. Connector gaps (authorized fetch, ipcam, FTPS paths, extension exports) closed by PRN-319 to 339.
