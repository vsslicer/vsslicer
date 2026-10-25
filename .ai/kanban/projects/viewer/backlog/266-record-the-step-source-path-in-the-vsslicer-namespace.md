---
id: 266
title: Record the STEP source path in the VSSlicer namespace
type: feature
priority: P1
effort: S
model: sonnet
area: [step]
story: US68
milestone: "VSS:M4"
sprint: "VSS:SP22"
depends_on: [265, 91]
created: 2026-10-25
---

Stores the source path and options of each STEP-imported object as a namespace record and offers it again when the user adds a STEP file.

**Code:** `vsslicer/modules/project-extension/src/application/stepSource.ts` (module: `project-extension`, layer: `application`)

## Acceptance criteria

- [ ] The record survives save and reopen
- [ ] A missing source file is not an error on open

## Tasks

- [ ] Record
- [ ] Tests

## Progress

Not started.
