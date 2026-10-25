---
id: I6
title: Project editor: prepare prints inside VS Code
status: approved
milestone: M4
order: 6
projects: VWR
phases: 6
---

## Problem

Viewing is not preparing: users still need another slicer to move, arrange, add supports blockers, set per-object overrides or save a project. Parity with Orca and PrusaSlicer for daily use starts here.

## Outcome

`vsslicer.project` in editor mode: transform, mirror, split, instance, merge; plates (create, duplicate, lock, delete, per-plate settings and G-code); per-object, part and range overrides; modifier and negative volumes, support blockers and enforcers; arrange; per-layer pause and colour change; mesh repair; STEP import (occt-import-js as a separate WASM); command-object undo and redo with hot-exit backup; a 3MF writer in the Bambu/Orca shape plus our own namespace, and a generic 3MF export; multi-root workspaces.

## Roadmap phases and feature-matrix rows

Roadmap phase(s) 6 (`.ai/plans/roadmap.md`). Rows (`docs/research/feature-matrix.md`): §3 P1 rows: Move/rotate/scale, Mirror/split/instances, Mesh repair, Modifier and negative volumes, Import STEP; §4 all P1 and P2 rows except SMT (P3); §9 3MF project (write side), Generic 3MF export, Embedded per-plate G-code (write), Undo/redo/autosave, Project folder with sidecars.

## Exit criteria

- Every edit operation has an inverse and the plate-membership invariants hold under property tests
- Open, edit, save, re-open round trips in our reader; every saved 3MF re-slices with the pinned Orca CLI with the same plates and objects; a manual matrix opens them in Orca and Bambu Studio
- Arrange meets the fixture metrics (bed utilisation, no overlaps); STEP fixtures import
- Hot exit restores an unsaved project

## Order: 6 of 11

Sixth: the first usability initiative. It needs I2's reader and I5 to slice the edited plate. Arrange and mesh repair algorithms were not researched in R1; under D2 the Orca implementations may be ported, which is recorded as an epic-level decision.

Order rationale follows the roadmap's rule: testability first (libraries checked against deterministic fixtures and external oracles), usability next (daily workflows on proven foundations), functionality last (breadth, optional engines, the fork).
