---
id: 127
title: Find projects in every workspace folder
type: feature
priority: P1
effort: M
model: sonnet
area: [editor]
story: US40
milestone: "VSS:M4"
sprint: "VSS:SP27"
depends_on: [126, 59]
created: 2026-10-25
---

Discovers 3MF projects in all workspace folders, shows them in the tree roots and opens each in its own editor.

**Code:** `vsslicer/modules/apps/project/src/presentation/workspace/` (module: `project-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] Two folders with projects both list their projects
- [ ] Adding or removing a workspace folder updates the list

## Tasks

- [ ] Discovery
- [ ] Tree roots
- [ ] Test host test

## Progress

Not started.
