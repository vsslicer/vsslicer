---
id: 31
title: Stories and tasks for I3
type: chore
priority: P1
effort: L
model: opus
area: [profiles]
created: 2026-10-25
---

Break I3 into user-visible stories and one-commit task cards on the boards of its epics' projects, ready for `plan-sprints`.

## Acceptance criteria

- [x] Every I3 epic has stories (`epic: VSS:E<n>`) on its `project:` board covering its scope, feature-matrix rows and acceptance criteria
- [x] Task cards sized for one agent and one commit, with acceptance criteria and tasks, `effort`, `priority`, `model` and `milestone` set
- [x] Each card names its package path under `vsslicer/` and its Clean-architecture layer; no card mixes layers
- [x] `depends_on` set for every real dependency, including cross-project and M1 cards
- [x] Reviewed by the planner; `board.py check` passes on every board

## Tasks

- [x] Dispatch Sonnet workers per project
- [x] Review coverage, sizes and dependencies; send gaps back
- [x] Wire cross-project dependencies

## Progress

Done. PRF: stories US1-US49, cards PRF-1 to PRF-146, 398 points; M2 except PRF-94 and PRF-146 (M3, they need the printer registry). Modules `profile-api`, `profiles`, `profiles-prusa`, `profiles-orca`, `profiles-cura`, `profiles-data-orca`, `profiles-extension`; releases PRF-135 to PRF-145. E16 defines `printer_instance` with a static host_type list in M2; PRF-146 switches to the registry in M3. Embedded 3MF config wired to VWR-74.
