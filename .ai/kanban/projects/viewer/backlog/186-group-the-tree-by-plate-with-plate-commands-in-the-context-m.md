---
id: 186
title: Group the tree by plate with plate commands in the context menu
type: feature
priority: P1
effort: M
model: sonnet
area: [plates]
story: US51
milestone: "VSS:M4"
sprint: "VSS:SP20"
depends_on: [59, 173, 174]
created: 2026-10-25
---

The project tree shows plates with their objects and offers create, duplicate, rename, lock, delete and reorder.

**Code:** `vsslicer/modules/project-extension/src/presentation/tree/` (module: `project-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] Each plate command from the menu changes the tree and undoes
- [ ] Commands that a locked plate refuses are disabled with the reason as tooltip

## Tasks

- [ ] Tree grouping
- [ ] Menu
- [ ] Test host test

## Progress

Not started.
