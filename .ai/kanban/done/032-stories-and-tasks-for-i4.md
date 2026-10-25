---
id: 32
title: Stories and tasks for I4
type: chore
priority: P1
effort: L
model: opus
area: [printers, platform]
created: 2026-10-25
---

Break I4 into user-visible stories and one-commit task cards on the boards of its epics' projects, ready for `plan-sprints`.

## Acceptance criteria

- [x] Every I4 epic has stories (`epic: VSS:E<n>`) on its `project:` board covering its scope, feature-matrix rows and acceptance criteria
- [x] Task cards sized for one agent and one commit, with acceptance criteria and tasks, `effort`, `priority`, `model` and `milestone` set
- [x] Each card names its package path under `vsslicer/` and its Clean-architecture layer; no card mixes layers
- [x] `depends_on` set for every real dependency, including cross-project and M1 cards
- [x] Reviewed by the planner; `board.py check` passes on every board

## Tasks

- [x] Dispatch Sonnet workers per project
- [x] Review coverage, sizes and dependencies; send gaps back
- [x] Wire cross-project dependencies

## Progress

Done. PRN: stories US2-US35, cards PRN-2 to PRN-179, 406 points. PLT: E19 stories US40-US49, cards PLT-49 to PLT-79 (agent-protocol; releases PLT-72, PLT-79). All M3. Modules `printer-api`, `printer-bambu`, `bambu-extension`, `printer-agent`, `printer-moonraker`, `printer-octoprint`, `printer-prusalink`, `printer-duet`, `printer-discovery`, `printer-folder`, `printers-extension`. The daemon and connectors are wired to the agent-protocol releases, the registry to PRF-136 and PRF-86, and AMS mapping to VWR-74.
