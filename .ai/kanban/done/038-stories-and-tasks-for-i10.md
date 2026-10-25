---
id: 38
title: Stories and tasks for I10
type: chore
priority: P1
effort: XL
model: opus
area: [slicer, viewer, profiles, printers, gcode, platform]
created: 2026-10-25
---

Break I10 into user-visible stories and one-commit task cards on the boards of its epics' projects, ready for `plan-sprints`.

## Acceptance criteria

- [x] Every I10 epic has stories (`epic: VSS:E<n>`) on its `project:` board covering its scope, feature-matrix rows and acceptance criteria
- [x] Task cards sized for one agent and one commit, with acceptance criteria and tasks, `effort`, `priority`, `model` and `milestone` set
- [x] Each card names its package path under `vsslicer/` and its Clean-architecture layer; no card mixes layers
- [x] `depends_on` set for every real dependency, including cross-project and M1 cards
- [x] Reviewed by the planner; `board.py check` passes on every board

## Tasks

- [x] Dispatch Sonnet workers per project
- [x] Review coverage, sizes and dependencies; send gaps back
- [x] Wire cross-project dependencies

## Progress

Done. M5 (I10), 441 cards, 1082 points. SLC: US40-US76, SLC-131 to 276 (new modules `calibration`, `multimaterial`, `slicer-prusa`, `slicer-embedded`). VWR: US80-US98, VWR-273 to 388 (new `mesh-boolean`). PRN: US60-US74, PRN-342 to 442 (`printer-serial`, `printers-serial-extension`, `printers-unofficial-extension`, six `printer-unofficial-*` connectors). PRF: US60-US65, PRF-147 to 176 (intent profiles, update channel). GCP: US40-US47, GCP-58 to 75 (`gcode-templates`). PLT: US50-US56, PLT-80 to 109 (web builds). Deferred P3 epics E49, E51, E56, E58, E61, E67 have no cards (D13). PLT's browser-path releases renumbered to `3mf@0.7.1` and `mesh@0.8.1` after VWR's 0.6-0.8 releases.
