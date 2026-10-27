---
id: 191
title: Test the layer slider to project command contract
type: feature
priority: P1
effort: S
model: sonnet
area: [plates]
story: US54
milestone: "VSS:M4"
sprint: "VSS:SP28"
depends_on: [190, GCP-35, GCP-50, PLT-15]
created: 2026-10-25
---

A test-host test where the preview's slider command calls the project command and the entry lands on the right plate.

**Code:** `vsslicer/modules/apps/project/test/integration/slider/` (module: `project-extension`, layer: n/a (integration tests))

## Acceptance criteria

- [ ] Adding an entry from the preview command stores it on the plate that the preview shows
- [ ] Undo in the project removes it

## Tasks

- [ ] Test

## Progress

Not started.
