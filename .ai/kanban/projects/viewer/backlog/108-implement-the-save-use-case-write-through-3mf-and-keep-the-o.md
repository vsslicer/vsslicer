---
id: 108
title: "Implement the save use case: write through 3mf and keep the original on failure"
type: feature
priority: P1
effort: M
model: sonnet
area: [editor]
story: US36
milestone: "VSS:M4"
sprint: "VSS:SP25"
depends_on: [101, 91]
created: 2026-10-25
---

Takes the model, calls `writeProject` and the atomic sink, and returns the save notice. Save As writes a new file; failures surface as typed errors with the original intact.

**Code:** `vsslicer/modules/project-extension/src/application/save.ts` (module: `project-extension`, layer: `application`)

## Acceptance criteria

- [ ] A fixture project edited by two commands saves and reopens equal
- [ ] A failing sink leaves the original and reports the cause
- [ ] The notice from the writer is returned

## Tasks

- [ ] Use case
- [ ] Error mapping
- [ ] Tests

## Progress

Not started.
