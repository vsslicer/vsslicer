---
id: 194
title: Add Slice plate and Slice all to the plate menu
type: feature
priority: P1
effort: S
model: sonnet
area: [plates]
story: US56
milestone: "VSS:M4"
sprint: "VSS:SP30"
depends_on: [193, SLC-106, SLC-125]
created: 2026-10-25
---

Menu entries that call the slicer extension's commands for the plate or all plates.

**Code:** `vsslicer/modules/apps/project/src/presentation/tree/` (module: `project-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] With the slicer extension absent the entries are hidden
- [ ] With it present the command receives the plate number and the project URI

## Tasks

- [ ] Menu entries
- [ ] Test with a stub command

## Progress

Not started.
