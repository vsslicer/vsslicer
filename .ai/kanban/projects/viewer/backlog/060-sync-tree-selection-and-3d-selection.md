---
id: 60
title: Sync tree selection and 3D selection
type: feature
priority: P0
effort: S
model: sonnet
area: [plates]
story: US18
milestone: "VSS:M2"
sprint: "VSS:SP10"
depends_on: [59, 57]
created: 2026-10-25
---

Selecting in either place updates the other.

**Code:** `vsslicer/modules/project-extension/src/presentation/` (module: `project-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] Tree select highlights in 3D and 3D select reveals in tree; tested in the webview harness from E1 (PLT-38)

## Tasks

- [ ] Messages both ways
- [ ] Harness test

## Progress

Not started.
