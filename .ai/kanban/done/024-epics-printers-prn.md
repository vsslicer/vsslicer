---
id: 24
title: "Epics: printers (PRN)"
type: chore
priority: P0
effort: L
model: opus
area: [platform]
milestone: R2
created: 2026-10-25
---

Write the PRN project's epics from the feature-matrix rows it owns and the initiatives they serve; review with gstack plan-eng-review criteria.

## Acceptance criteria

- [x] Every feature-matrix row the project owns lands in exactly one epic
- [x] Each epic has scope, rows covered, acceptance criteria, dependencies (KEY:E<n> across projects), order within the project, initiative: VSS:I<n>
- [x] Eng-review findings applied; outcome in the planning log
- [x] board.py --board projects/<name>/.ai/kanban check prints Board OK

## Tasks

- [x] Dispatch worker
- [x] Review epics
- [x] Fix and check

## Progress

Done. 13 epics written by an opus worker on the PRN board, eng-reviewed by the worker against gstack plan-eng-review criteria, then moved by the coordinator onto the VSS board with VSS-wide numbers (owner correction: epics live on VSS with `project: PRN`), cross-project references rewritten, coordinator reconciliation notes appended where the hand-backs raised interface questions. Every feature-matrix row the project owns is in exactly one epic (checked by script across all 69 epics). Board OK on all eight boards.
