---
id: 124
title: Offer the .gitignore entry for the project folder
type: feature
priority: P1
effort: S
model: sonnet
area: [editor]
story: US39
milestone: "VSS:M4"
sprint: "VSS:SP27"
depends_on: [123]
created: 2026-10-25
---

On first creation of the folder in a git workspace, offers to add `.vsslicer/` to `.gitignore`; never edits without a yes.

**Code:** `vsslicer/modules/apps/project/src/presentation/folder/` (module: `project-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] The offer appears once per workspace and a No is remembered
- [ ] Yes appends the entry once

## Tasks

- [ ] Prompt
- [ ] Test host test

## Progress

Not started.
