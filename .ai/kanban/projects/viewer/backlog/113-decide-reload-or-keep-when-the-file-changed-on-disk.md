---
id: 113
title: Decide reload or keep when the file changed on disk
type: feature
priority: P1
effort: S
model: sonnet
area: [editor]
story: US38
milestone: "VSS:M4"
sprint: "VSS:SP25"
depends_on: [101]
created: 2026-10-25
---

A pure decision over the document state and the change: clean documents reload quietly; dirty documents ask, and the unsaved log is kept as a recoverable copy until dismissed.

**Code:** `vsslicer/modules/project-extension/src/application/externalChange.ts` (module: `project-extension`, layer: `application`)

## Acceptance criteria

- [ ] Clean document: reload without prompt
- [ ] Dirty document: the outcome asks, and both answers keep the log recoverable
- [ ] A change that touches only the modified time (same bytes) is ignored

## Tasks

- [ ] Decision function
- [ ] Recoverable copy
- [ ] Tests

## Progress

Not started.
