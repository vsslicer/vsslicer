---
id: 171
title: Define the plate invariants as pure checks
type: feature
priority: P1
effort: S
model: sonnet
area: [plates]
story: US50
milestone: "VSS:M4"
sprint: "VSS:SP27"
depends_on: [52]
created: 2026-10-25
---

Pure functions that report violations: an instance on no plate or two plates, a locked plate changed, a plate count above 36.

**Code:** `vsslicer/modules/apps/project/src/domain/plates/invariants.ts` (module: `project-extension`, layer: `domain`)

## Acceptance criteria

- [ ] Each rule has a passing and a failing fixture
- [ ] The checks run on a `ProjectModel` snapshot with no I/O

## Tasks

- [ ] Rules
- [ ] Tests

## Progress

Not started.
