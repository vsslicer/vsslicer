---
id: 23
title: "Epics: profiles (PRF)"
type: chore
priority: P0
effort: L
model: opus
area: [platform]
milestone: R2
created: 2026-10-25
---

Write the PRF project's epics from the feature-matrix rows it owns and the initiatives they serve; review with gstack plan-eng-review criteria.

## Acceptance criteria

- [ ] Every feature-matrix row the project owns lands in exactly one epic
- [ ] Each epic has scope, rows covered, acceptance criteria, dependencies (KEY:E<n> across projects), order within the project, initiative: VSS:I<n>
- [ ] Eng-review findings applied; outcome in the planning log
- [ ] board.py --board projects/<name>/.ai/kanban check prints Board OK

## Tasks

- [ ] Dispatch worker
- [ ] Review epics
- [ ] Fix and check

## Progress

Not started.
